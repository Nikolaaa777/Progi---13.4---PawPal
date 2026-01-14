import "../../styles/all.css";
import { NavLink } from "react-router-dom";

export default function ProfileInfo() {
	return (
		<div className="app">
			<aside className="sidebar">
				<div className="back-arrow">←</div>

				<div className="profile">
					<div className="avatar"></div>
					<div className="username">ImePrezime vlasnika</div>
				</div>

				<nav className="menu">
					<a className="active">Moje informacije</a>
					<NavLink to="/profile/ljubimci">Moji ljubimci</NavLink>
					<a>Moje rezervacije</a>
				</nav>
			</aside>

			<main className="content">
				<h1>Moje informacije</h1>
				<div className="center-text">SADRŽAJ</div>

				<button className="edit-btn">
					Uredi profil
					<span className="icon-btn">
						<img src="/images/edit.png" alt="edit" />
					</span>
				</button>
			</main>
		</div>
	);
}
