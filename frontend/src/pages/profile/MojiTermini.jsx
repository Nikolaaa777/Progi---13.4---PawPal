import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/termini.css";

const WALK_TYPE_LABELS = {
	1: "Individualna",
	2: "Grupna",
};

const MojiTermini = () => {
	const navigate = useNavigate();

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);

			const walksRes = await api.walks();

			const walks = (walksRes.data || []).map((w) => ({
				id: w.idSetnje,
				type: "walk",
				date: w.terminSetnje,
				duration: w.trajanjeSetnje,
				price: w.cijenaSetnje,
				walkType: w.tipSetnje,
				town: w.city,
				status: "Planiran",
			}));

			setItems(
				walks.sort((a, b) => String(a.date).localeCompare(String(b.date))),
			);
		} catch (err) {
			console.error(err);
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (id) => {
		navigate(`/profile/termini/${id}/uredi`);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Obrisati termin?")) return;
		await api.deleteWalk(id);
		loadData();
	};

	const handleChat = (id) => {
		navigate(`/chat?reservationId=${id}`);
	};

	const handleFinish = async (id) => {
		if (!window.confirm("Označiti šetnju kao završenu?")) return;
		await api.markWalkDone(id);
		loadData();
	};

	const formatDate = (iso) => {
		if (!iso) return "";
		const [d] = String(iso).split("T");
		const [y, m, day] = d.split("-");
		return `${day}. ${m}. ${y}.`;
	};

	const formatTime = (iso) => {
		if (!iso) return "";
		const [, t = ""] = String(iso).split("T");
		return t.slice(0, 5);
	};

	const getStatusClass = (status) => {
		const s = status.toLowerCase();
		if (s.includes("zavr")) return "zavrsen";
		if (s.includes("rezerv")) return "aktivan";
		return "planiran";
	};

	if (loading) {
		return <div className="loading">Učitavanje...</div>;
	}

	return (
		<div className="app">
			<main className="Walk-Appointments-content">
				<h1 className="Walk-Appointments-title">Moji termini</h1>

				<div className="Walk-Appointments">
					<div className="Walk-Appointments__inner">
						{items.map((item) => (
							<div
								key={`${item.type}-${item.id}`}
								className="Walk-Appointment-card"
							>
								<div className="Walk-Appointment-left">
									<div className="Walk-calendar">
										<img src="/calendar.png" alt="calendar" />
									</div>

									<div className="Walk-Appointment-text">
										<div className="Walk-Appointment-date">
											{formatDate(item.date)} · {formatTime(item.date)}
										</div>

										<div className="Walk-Appointment-info">
											{WALK_TYPE_LABELS[item.walkType] ?? "—"} · {item.town}
										</div>

										<div className="Walk-Appointment-info">
											Trajanje: {item.duration} · {item.price} €
										</div>
									</div>
								</div>

								<div className="iconsWalk">
									<div
										className={`Walk-status-Appointment ${getStatusClass(
											item.status,
										)}`}
									>
										{item.status}
									</div>

									{item.type === "walk" && item.status === "Planiran" && (
										<button
											className="editAppointment-btn"
											onClick={() => handleFinish(item.id)}
										>
											Završi
										</button>
									)}

									<button
										className="editAppointment-btn"
										onClick={() => handleEdit(item.id)}
									>
										<img src="/edit.png" alt="edit" />
										Uredi
									</button>

									<button
										className="deleteAppointment-btn"
										onClick={() => handleDelete(item.id)}
									>
										<img src="/bin.png" alt="trash" />
									</button>
								</div>
							</div>
						))}

						<NavLink to="/profile/termini/dodaj" className="addAppointment-btn">
							Dodaj termin <img src="/plus.png" alt="plus" />
						</NavLink>
					</div>
				</div>
			</main>
		</div>
	);
};

export default MojiTermini;
