import "../../styles/all.css";
import { useNavigate } from "react-router-dom";

export default function MojiLjubimci() {
	const nav = useNavigate();

	// privremeni dummy podaci (kasnije spoji na backend)
	const pets = [
		{ id: 1, name: "Rex", breed: "Zlatni retriver", age: 4 },
		{ id: 2, name: "Bela", breed: "Njemački ovčar", age: 2 },
		{ id: 3, name: "Luna", breed: "Mješanac", age: 6 },
	];

	return (
		<main className="content pets-content">
			<div className="pets-shell">
				<div className="pets-header">
					<h1 className="pets-title">Moji ljubimci</h1>
				</div>

				<div className="pets-list">
					{pets.map((p) => (
						<div key={p.id} className="pet-card">
							<div className="pet-left">
								<div className="pet-avatar" />
								<div className="pet-info">
									<div className="pet-name">{p.name}</div>
									<div className="pet-sub">{p.breed}</div>
									<div className="pet-sub">Starost: {p.age} godine</div>
								</div>
							</div>

							<div className="pet-actions">
								<button
									className="pet-action edit"
									onClick={() => nav(`/profile/ljubimci/${p.id}/uredi`)}
								>
									Edit
								</button>
								<button className="pet-action delete">
									<img src="/bin.png" alt="Delete" />{" "}
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
