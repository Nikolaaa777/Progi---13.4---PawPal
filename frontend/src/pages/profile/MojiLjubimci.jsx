import "../../styles/all.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function MojiLjubimci() {
	const nav = useNavigate();

	//podaci o ljubimcima
	const [pets, setPets] = useState([]);

	useEffect(() => {
		api
			.dogs()
			.then(setPets)
			.catch((e) => console.error("Failed to load dogs", e));
	}, []);

	const onDelete = async (idPsa) => {
		try {
			await api.deleteDog(idPsa);
			setPets((prev) => prev.filter((x) => x.idPsa !== idPsa));
		} catch (e) {
			console.error("Delete failed", e);
		}
	};

	return (
		<main className="content pets-content">
			<div className="pets-shell">
				<div className="pets-header">
					<h1 className="pets-title">Moji ljubimci</h1>
				</div>

				<div className="pets-list">
					{pets.map((p) => (
						<div key={p.idPsa} className="pet-card">
							<div className="pet-left">
								<div className="pet-avatar" />
								<div className="pet-info">
									<div className="pet-name">{p.imePsa}</div>
									<div className="pet-sub">{p.pasminaPsa}</div>
									<div className="pet-sub">Starost: {p.starostPsa} godine</div>
								</div>
							</div>

							<div className="pet-actions">
								<button
									className="pet-action edit"
									onClick={() => nav(`/profile/ljubimci/${p.idPsa}/uredi`)}
								>
									Edit
								</button>
								<button
									className="pet-action delete"
									onClick={() => onDelete(p.idPsa)}
								>
									<img src="/bin.png" alt="Delete" />
								</button>
							</div>
						</div>
					))}
				</div>

				<button
					className="pets-add"
					onClick={() => nav("/profile/ljubimci/dodaj")}
				>
					<span className="pets-add-plus">+</span>
					Dodaj psa
				</button>
			</div>
		</main>
	);
}
