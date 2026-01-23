import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import PaymentModal from "../../components/PaymentModal";
import "../../styles/rezervacije.css";

const MojeRezervacije = () => {
	const navigate = useNavigate();

	const [rezervacije, setRezervacije] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [selectedReservation, setSelectedReservation] = useState(null);
	const [dogs, setDogs] = useState({});
	const [currentUser, setCurrentUser] = useState(null);

	useEffect(() => {
		loadReservations();
		loadDogs();
		loadCurrentUser();
	}, []);

	const loadReservations = async () => {
		try {
			setLoading(true);
			const response = await api.getMyReservations();

			if (response.success) {
				const accepted = (response.data || [])
					.filter((r) => r.potvrdeno === true)
					.filter((r) => r.walk_details?.terminSetnje);

				setRezervacije(accepted);
			} else {
				setError(response.message || "Failed to load reservations");
			}
		} catch (err) {
			setError(err.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const loadDogs = async () => {
		try {
			const dogsData = await api.dogs();
			const dogsMap = {};
			dogsData.forEach((dog) => {
				dogsMap[dog.idPsa] = dog.imePsa;
			});
			setDogs(dogsMap);
		} catch (err) {
			console.error(err);
		}
	};

	const loadCurrentUser = async () => {
		try {
			const user = await api.me();
			setCurrentUser(user);
		} catch (err) {
			console.error(err);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Jeste li sigurni?")) return;
		await api.deleteReservation(id);
		loadReservations();
	};

	const handlePayment = (reservation) => {
		setSelectedReservation(reservation);
		setShowPaymentModal(true);
	};

	const handlePaymentSuccess = () => {
		setShowPaymentModal(false);
		loadReservations();
	};

	const handleReview = (reservationId) => {
		navigate(`/ocijeni/${reservationId}`);
	};

	const handleChat = (id) => {
		navigate(`/chat?reservationId=${id}`);
	};

	const handleFinish = async (id) => {
		if (!window.confirm("Označiti šetnju kao završenu?")) return;
		try {
			await api.markWalkDone(id);
			loadReservations();
		} catch (err) {
			console.error(err);
			alert("Greška pri označavanju šetnje kao završene.");
		}
	};

	const getStatus = (r) => {
		if (r.odradena) return "Završena";
		if (r.potvrdeno === true) return "Potvrđena";
		if (r.potvrdeno === false) return "Odbijena";
		return "Na čekanju";
	};

	const getStatusClass = (status) => {
		if (status.includes("Zavr")) return "zavrsena";
		if (status.includes("Odb")) return "otkazana";
		if (status.includes("ček")) return "planirana";
		if (status.includes("Potv")) return "aktivna";
		return "";
	};

	if (loading) {
		return <div style={{ padding: 40 }}>Učitavanje...</div>;
	}

	return (
		<div className="app">
			<main className="content">
				<h1 className="page-title">Moje rezervacije</h1>

				{error && <div className="error">{error}</div>}

				{rezervacije.map((r) => {
					const status = getStatus(r);
					const statusClass = getStatusClass(status);
					const isCompleted = r.odradena;
					const isPaid = r.payment_status === "COMPLETED";
					// Only show finish button for walkers who are the walker for this specific reservation
					const isWalker = currentUser?.role === "WALKER" || currentUser?.is_walker === true;
					const isWalkerForThisReservation = isWalker && currentUser?.email === r.walker_email;
					const canFinish = isWalkerForThisReservation && r.potvrdeno === true && !r.odradena;
					// Only show payment button for owners (not walkers)
					const isOwner = !isWalker;
					const canPay = isOwner && isCompleted && !isPaid;

					return (
						<div key={r.idRezervacije} className="Walk-Reservation-card">
							<div className="Walk-Reservation-left">
								<div className="Walk-calendar">
									<img src="/calendar.png" alt="" />
								</div>

								<div className="Walk-Reservation-text">
									<div>Rezervacija #{r.idRezervacije}</div>
									<div>Pas: {dogs[r.idPsa]}</div>
									<div>Šetač: {r.walker_name}</div>
									<div>
										Cijena: {r.walk_details?.cijenaSetnje?.toFixed(2)} €
									</div>
								</div>
							</div>

							<div className="iconsWalk">
								<div className={`Walk-status-reservation ${statusClass}`}>
									{status}
								</div>

								{isCompleted && isOwner &&
									(isPaid ? (
										<button
											className="reviewReservation-btn"
											onClick={() => handleReview(r.idRezervacije)}
										>
											Ocijeni
										</button>
									) : (
										canPay && (
											<button
												className="payReservation-btn"
												onClick={() => handlePayment(r)}
											>
												Plati
											</button>
										)
									))}

								{canFinish && (
									<button
										className="finishReservation-btn"
										onClick={() => handleFinish(r.idRezervacije)}
									>
										Završi
									</button>
								)}

								{r.potvrdeno && (
									<button
										className="chatReservation-btn"
										onClick={() => handleChat(r.idRezervacije)}
									>
										💬
									</button>
								)}

								<button
									className="deleteReservation-btn"
									onClick={() => handleDelete(r.idRezervacije)}
								>
									🗑
								</button>
							</div>
						</div>
					);
				})}

				{showPaymentModal && selectedReservation && (
					<PaymentModal
						isOpen={showPaymentModal}
						onClose={() => setShowPaymentModal(false)}
						reservationId={selectedReservation.idRezervacije}
						amount={selectedReservation.walk_details?.cijenaSetnje}
						onSuccess={handlePaymentSuccess}
					/>
				)}
			</main>
		</div>
	);
};

export default MojeRezervacije;
