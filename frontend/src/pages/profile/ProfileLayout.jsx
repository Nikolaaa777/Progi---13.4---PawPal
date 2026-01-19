import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "../../styles/profileMenu.css";

export default function ProfileLayout() {
	const nav = useNavigate();
	const location = useLocation();
	const [me, setMe] = useState(null);

	useEffect(() => {
		api
			.me()
			.then(setMe)
			.catch(() => setMe(null));
	}, []);

	useEffect(() => {
		if (!me) return;
		if (location.pathname !== "/profile") return;

		if (me.role === "ADMIN") nav("/admin", { replace: true });
	}, [me, location.pathname, nav]);

	const isWalker = me?.role === "WALKER";

	return (
		<div className="app">
			<aside className="sidebar">
				<nav className="menu">
					<div className="back-arrow" onClick={() => nav("/")}>
						←
					</div>

					{/* Vlasnik menu */}
					<NavLink end to="/profile">Moje informacije</NavLink>

					{!isWalker && (
						<>
							<NavLink to="/profile/ljubimci">Moji ljubimci</NavLink>
							<NavLink to="/profile/rezervacije">Moje rezervacije</NavLink>
						</>
					)}

					{/* Setac menu dodatak */}
					{isWalker && (
						<>
							<NavLink to="/profile/termini">Moji termini</NavLink>
							<NavLink to="/profile/zahtjevi">Moji zahtjevi</NavLink>
							<NavLink to="/profile/clanarina">Moja članarina</NavLink>
						</>
					)}
				</nav>
			</aside>
			<Outlet />
		</div>
	);
}
