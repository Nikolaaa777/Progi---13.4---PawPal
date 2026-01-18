import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/adminKom.css";

export default function AdminKomentari() {
	const nav = useNavigate();

	return (
		<div className="appComments">
			<aside className="sidebarComments">
				<div className="backComments" onClick={() => nav("/")}>
					←
				</div>

				<div className="profileComments">
					<img className="avatarComments" src="/admin.png" alt="Avatar" />
					<div>
						<strong>ImePrezime Admina</strong>
					</div>
				</div>

				<nav className="menuComments">
					<NavLink
						to="/admin"
						className={({ isActive }) => (isActive ? "active" : undefined)}
					>
						Generalno
					</NavLink>

					<NavLink
						to="/adminKom"
						className={({ isActive }) => (isActive ? "active" : undefined)}
					>
						Komentari
					</NavLink>

					<NavLink
						to="/adminKorisnici"
						className={({ isActive }) => (isActive ? "active" : undefined)}
					>
						Korisnici
					</NavLink>
				</nav>
			</aside>

			<main className="contentComments">
				<h1 className="titleComments">Komentari</h1>

				<div className="commentsComments">
					{Array.from({ length: 11 }).map((_, i) => (
						<div className="commentComments" key={i}>
							<span>Komentar</span>
							<button className="deleteComments">
								<img src="/bin.png" alt="trash" />
							</button>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
