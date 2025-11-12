import { NavLink, useNavigate } from "react-router-dom";
import logo from "/logo.png";
import "../styles/home.css";

export default function Navbar() {
	const nav = useNavigate();

	return (
		<header className="nav-wrap">
			<div className="nav">
				<div className="nav-left">
					<a className="brand" href="/">
						<img src={logo} alt="PawPal logo" className="brand-logo" />
						<span>PawPal</span>
					</a>
				</div>
				<div className="nav-right">
					<nav className="nav-pills" aria-label="Glavna navigacija">
						<NavLink to="/novosti" end className="pill">
							Novosti
						</NavLink>
						<NavLink to="/setnje" className="pill">
							Dostupne šetnje
						</NavLink>
						<NavLink to="/setaci" className="pill">
							Naši šetači
						</NavLink>
						<NavLink to="/kontakt" className="pill">
							Kontakt
						</NavLink>

						<img
							src="/korisnik.png"
							alt="Korisnik"
							className="user-icon"
							onClick={() => nav("/login")}
						/>
					</nav>
				</div>
			</div>
		</header>
	);
}
