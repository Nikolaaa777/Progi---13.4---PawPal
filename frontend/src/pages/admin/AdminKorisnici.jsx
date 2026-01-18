import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/adminKorisnici.css";

export default function AdminKor() {
	const nav = useNavigate();

	return (
		<div className="appKorisnici">
			<aside className="sidebarKorisnici">
				<div className="backKorisnici" onClick={() => nav("/")}>
					←
				</div>

				<div className="profileKorisnici">
					<img className="avatarKorisnici" src="/admin.png" alt="Avatar" />
					<div>
						<strong>ImePrezime Admina</strong>
					</div>
				</div>

				<nav className="menuKorisnici">
					<NavLink to="/admin" className={({ isActive }) => isActive ? "active" : undefined}>
						Generalno
					</NavLink>

					<NavLink to="/adminKom" className={({ isActive }) => isActive ? "active" : undefined}>
						Komentari
					</NavLink>

					<NavLink to="/adminKorisnici" className={({ isActive }) => isActive ? "active" : undefined}>
						Korisnici
					</NavLink>
				</nav>
			</aside>

			<main className="contentKorisnici">
				<h1 className="titleKorisnici">Korisnici</h1>

				<div className="usersKorisnici">
					{Array.from({ length: 6 }).map((_, i) => (
						<div className="userKorisnici" key={i}>
							<span>Korisnik</span>

							<div className="actionsKorisnici">
								<button className="actionKorisnici ban">
									<img src="/ban.png" alt="ban" />
								</button>

								<button className="actionKorisnici delete">
									<img src="/bin.png" alt="trash" />
								</button>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
