import { NavLink } from "react-router-dom";
import logo from "/logo.png";
import "../styles/home.css";

export default function Navbar() {
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
						<NavLink to="/" end className="pill">
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
					</nav>
				</div>
			</div>
		</header>
	);
}
