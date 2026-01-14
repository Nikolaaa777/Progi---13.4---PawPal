import "../../styles/all.css";

export default function ProfileInfo() {
	// kasnije ovo zamijeni s pravim podacima iz api.me()
	const user = {
		full_name: "Ime Prezime",
		email: "user@mail.com",
		city: "Zagreb",
		role: "Vlasnik psa",
		petsCount: 3,
		walksTotal: 12,
		walkerRating: 4.8,
	};

	return (
		<main className="content">
			<h1 className="page-title">Moje informacije</h1>

			<section className="info-card">
				<h2 className="info-name">{user.full_name}</h2>

				<div className="info-row">
					<span className="info-icon">✉️</span>
					<span>{user.email}</span>
				</div>

				<div className="info-row">
					<span className="info-icon">📍</span>
					<span>Grad: {user.city}</span>
				</div>

				<div className="info-row">
					<span className="info-icon">👤</span>
					<span>Tip: {user.role}</span>
				</div>
			</section>

			<section className="stats-row">
				<div className="stat-card">
					<div className="stat-toprow">
						<img src="/paw.png" alt="ljubimci" className="stat-icon" />
						<div className="stat-value">3</div>
					</div>
					<div className="stat-label">Ljubimca</div>
				</div>

				<div className="stat-card">
					<div className="stat-toprow">
						<img src="/walk.png" alt="šetnje" className="stat-icon" />
						<div className="stat-value">12</div>
					</div>
					<div className="stat-label">Ukupno šetnji</div>
				</div>

				<div className="stat-card">
					<div className="stat-toprow">
						<img src="/star.png" alt="ocjena" className="stat-icon" />
						<div className="stat-value">4.8</div>
					</div>
					<div className="stat-label">Ocjena šetača</div>
				</div>
			</section>

			<section className="actions-row">
				<button className="action-btn primary">Neki gumb</button>
				<button className="action-btn">Uredi profil</button>

				<label className="notif-toggle">
					<span>Obavijesti</span>
					<input type="checkbox" />
					<span className="toggle-ui" />
				</label>
			</section>
		</main>
	);
}
