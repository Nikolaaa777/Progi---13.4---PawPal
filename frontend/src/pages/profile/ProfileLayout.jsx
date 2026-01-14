import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/all.css";

export default function ProfileLayout() {
	const nav = useNavigate();

	return (
		<div className="app">
			<aside className="sidebar">
				<div className="back-arrow" onClick={() => nav("/")}>
					←
				</div>

				<div className="profile">
					<div className="avatar"></div>
					<div className="username">ImePrezime vlasnika</div>
				</div>

				<nav className="menu">
					<NavLink end to="/profile">
						Moje informacije
					</NavLink>
					<NavLink to="/profile/ljubimci">Moji ljubimci</NavLink>
					<NavLink to="/profile/rezervacije">Moje rezervacije</NavLink>
				</nav>
			</aside>
			<Outlet />
		</div>
	);
}
