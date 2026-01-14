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
					<div className="stat-top">🐾</div>
					<div className="stat-value">{user.petsCount}</div>
					<div className="stat-label">ljubimca</div>
				</div>

				<div className="stat-card">
					<div className="stat-top">🚶</div>
					<div className="stat-value">{user.walksTotal}</div>
					<div className="stat-label">šetnji ukupno</div>
				</div>

				<div className="stat-card">
					<div className="stat-top">⭐</div>
					<div className="stat-value">{user.walkerRating}</div>
					<div className="stat-label">ocjena šetača</div>
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
