import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "/logo.png";
import { api } from "../api/client";
import "../styles/home.css";

export default function Navbar() {
	const nav = useNavigate();
	const [user, setUser] = useState(null);
	const [notifOn, setNotifOn] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);
	const avatarRef = useRef(null);

	useEffect(() => {
		api
			.me()
			.then((u) => {
				setUser(u);
				if (typeof u.has_notifications_on === "boolean") {
					setNotifOn(u.has_notifications_on);
				}
			})
			.catch(() => {
				setUser(null);
				setNotifOn(false);
			});
	}, []);

	useEffect(() => {
		function onDocClick(e) {
			if (!menuOpen) return;
			if (menuRef.current?.contains(e.target)) return;
			if (avatarRef.current?.contains(e.target)) return;
			setMenuOpen(false);
		}
		const onEsc = (e) => e.key === "Escape" && setMenuOpen(false);
		document.addEventListener("click", onDocClick);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("click", onDocClick);
			document.removeEventListener("keydown", onEsc);
		};
	}, [menuOpen]);

	async function handleLogout() {
		try {
			await api.logout();
			setUser(null);
		} catch (err) {
			console.error("Logout failed", err);
		} finally {
			window.location.href = "/";
		}
	}

	async function handleBell() {
		if (!user) {
			alert("Prijavi se za obavijesti.");
			nav("/login");
			return;
		}

		try {
			if (!notifOn) {
				const perm = await Notification.requestPermission();
				if (perm !== "granted") {
					alert("Obavijesti su onemogućene u pregledniku.");
					return;
				}
			}

			const data = await api.toggleNotifications();
			const on = !!data.has_notifications_on;
			setNotifOn(on);

			if (on) {
				alert("Obavijesti su uključene.");
			} else {
				alert("Obavijesti su isključene.");
			}
		} catch (err) {
			console.error(err);
			alert("Došlo je do greške pri spremanju obavijesti.");
		}
	}

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
					<nav className="nav-pills">
						<NavLink to="/novosti" className="pill">
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

						<button
							className={`icon-btn bell-icon ${notifOn ? "bell-on" : ""}`}
							aria-label={
								notifOn ? "Isključi obavijesti" : "Uključi obavijesti"
							}
							onClick={handleBell}
						>
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M12 2a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 5 15h14a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 2.995-2.824L15 19h-6a3 3 0 0 0 2.824 2.995L12 22z" />
							</svg>
						</button>

						<button className="icon-btn" aria-label="Chat">
							<img src="/chat.png" alt="Chat" className="chat-icon" />
						</button>

						<div
							className="avatar-wrap"
							onMouseEnter={() => setMenuOpen(true)}
							onMouseLeave={() => setMenuOpen(false)}
						>
							<button
								ref={avatarRef}
								className="icon-btn avatar-btn"
								aria-haspopup="menu"
								aria-expanded={menuOpen}
								onClick={() => setMenuOpen((v) => !v)}
							>
								<img src="/korisnik.png" alt="Korisnik" className="user-icon" />
							</button>

							{menuOpen && (
								<div ref={menuRef} className="user-menu" role="menu">
									<button
										className="menu-item"
										role="menuitem"
										onClick={() => nav("/profile")}
									>
										<span>Profile</span>
									</button>
									<button
										className="menu-item"
										role="menuitem"
										onClick={() => nav("/settings")}
									>
										<span>Settings</span>
									</button>
									<div className="menu-divider" role="separator" />
									{!user ? (
										<button
											className="menu-item"
											role="menuitem"
											onClick={() => nav("/login")}
										>
											<span>Log in</span>
										</button>
									) : (
										<button
											className="menu-item danger"
											role="menuitem"
											onClick={handleLogout}
										>
											<span>Logout</span>
										</button>
									)}
								</div>
							)}
						</div>
					</nav>
				</div>
			</div>
		</header>
	);
}
