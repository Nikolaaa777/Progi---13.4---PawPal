import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/profileMenu.css";

export default function ProfileLayout() {
	const nav = useNavigate();

	return (
		<div className="app">
			<aside className="sidebar">
				<div className="back-arrow" onClick={() => nav("/")}>
					←
				</div>

				<nav className="menu">
					<NavLink end to="/profile">Moje informacije</NavLink>
					<NavLink to="/profile/ljubimci">Moji ljubimci</NavLink>
					<NavLink to="/profile/rezervacije">Moje rezervacije</NavLink>
					<NavLink to="/profile/termini">Moji termini</NavLink>
					<NavLink to="/profile/zahtjevi">Zahtjevi za šetnju</NavLink>
				</nav>
			</aside>
			<Outlet />
		</div>
	);
}
