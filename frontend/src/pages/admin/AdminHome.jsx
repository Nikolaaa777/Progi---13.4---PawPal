import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/adminGen.css";

export default function AdminHome() {
	const nav = useNavigate();

	return (
		<div className="appAdmin">
			<aside className="sidebarAdmin">
				<div className="backAdmin" onClick={() => nav("/")}>
					←
				</div>

				<div className="profileAdmin">
					<img className="avatarAdmin" src="/admin.png" alt="admin" />
					<div>
						<strong>ImePrezime Admina</strong>
					</div>
				</div>

				<nav className="menuAdmin">
					<NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : undefined)}>
						Generalno
					</NavLink>

					<NavLink to="/adminKom" className={({ isActive }) => (isActive ? "active" : undefined)}>
						Komentari
					</NavLink>

					<NavLink to="/adminKorisnici" className={({ isActive }) => (isActive ? "active" : undefined)}>
						Korisnici
					</NavLink>
				</nav>
			</aside>

			<main className="contentAdmin">
				{/* ===== HEADER ===== */}
				<div className="headerAdmin">
					<h1>Generalno</h1>
				</div>

				{/* ===== GENERALNI INFO INPUT ===== */}
				<div className="cardAdmin">
					<h2>Generalni info</h2>
					<textarea
						className="textareaAdmin"
						placeholder="Unesi obavijest za korisnike..."
						rows={4}
					/>
				</div>

				<div className="centerAdmin">
					<button className="subscription-btn">
						Postavi članarinu
					</button>
				</div>

				{/* ===== OBAVIJEST INPUT ===== */}
				<div className="cardAdmin">
					<h2>Obavijest</h2>
					<textarea
						className="textareaAdmin"
						placeholder="Unesi obavijest za korisnike..."
						rows={4}
					/>
				</div>

				<div className="centerAdmin">
					<button className="notification-btn">
						Pošalji obavijest
					</button>
				</div>
			</main>
		</div>
	);
}