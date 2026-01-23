import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/client";
import "../styles/inbox.css";

export default function Inbox() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [notifOn, setNotifOn] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);

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

	// Load existing notifications from localStorage (filter out read ones)
	useEffect(() => {
		const stored = localStorage.getItem("pawpal_notifications");
		if (stored) {
			try {
				const allNotifs = JSON.parse(stored);
				// Filter out read notifications
				const unreadNotifs = allNotifs.filter((notif) => !notif.read);
				setNotifications(unreadNotifs);
				// Save back the filtered list
				if (unreadNotifs.length !== allNotifs.length) {
					localStorage.setItem("pawpal_notifications", JSON.stringify(unreadNotifs));
				}
			} catch (e) {
				console.error("Failed to parse stored notifications", e);
			}
		}
		setLoading(false);
	}, []);

	// Poll for walker registration events when notifications are enabled
	useEffect(() => {
		if (!user || !notifOn) {
			return;
		}

		// Get last seen event ID from localStorage
		const getLastEventId = () => {
			const stored = localStorage.getItem("pawpal_last_event_id");
			return stored ? parseInt(stored, 10) : 0;
		};

		// Save notifications to localStorage
		const saveNotifications = (notifs) => {
			localStorage.setItem("pawpal_notifications", JSON.stringify(notifs));
		};

		// Poll for new events
		const pollEvents = async () => {
			try {
				const lastId = getLastEventId();
				const response = await api.getNotificationEvents(lastId);

				if (response.events && response.events.length > 0) {
					// Add new notifications to the list
					const newNotifs = response.events.map((event) => ({
						id: event.id,
						walker_id: event.walker_id,
						first_name: event.first_name || "",
						last_name: event.last_name || "",
						created_at: event.created_at,
						message: `Novi šetač registriran: ${event.first_name || ""} ${event.last_name || ""}`.trim() || "Novi šetač registriran",
						read: false,
					}));

					// Add to existing notifications (newest first)
					setNotifications((prev) => {
						// Filter out any read notifications from prev (safety check)
						const unreadPrev = prev.filter((notif) => !notif.read);
						const updated = [...newNotifs, ...unreadPrev];
						// Remove duplicates based on id
						const unique = updated.filter(
							(notif, index, self) =>
								index === self.findIndex((n) => n.id === notif.id)
						);
						// Keep only last 50 notifications
						const limited = unique.slice(0, 50);
						saveNotifications(limited);
						return limited;
					});

					// Update last seen event ID
					if (response.latest_id) {
						localStorage.setItem("pawpal_last_event_id", response.latest_id.toString());
					}
				}
			} catch (err) {
				console.debug("Failed to poll notification events:", err);
			}
		};

		// Poll immediately, then every 15 seconds
		pollEvents();
		const intervalId = setInterval(pollEvents, 15000);

		return () => {
			clearInterval(intervalId);
		};
	}, [user, notifOn]);

	async function handleToggleNotifications(e) {
		if (!user) {
			alert("Prijavi se za obavijesti.");
			navigate("/login");
			return;
		}

		try {
			// If enabling, request permission first
			if (!notifOn) {
				const perm = await Notification.requestPermission();
				if (perm !== "granted") {
					return;
				}
			}

			const data = await api.toggleNotifications();
			const on = !!data.has_notifications_on;
			setNotifOn(on);

			// Remove read notifications when toggling
			if (on || !on) {
				setNotifications((prev) => {
					const unread = prev.filter((notif) => !notif.read);
					localStorage.setItem("pawpal_notifications", JSON.stringify(unread));
					return unread;
				});
			}
		} catch (err) {
			console.error(err);
		}
	}

	function handleMarkAsRead(notifId) {
		setNotifications((prev) => {
			const updated = prev.map((notif) =>
				notif.id === notifId ? { ...notif, read: true } : notif
			);
			// Filter out read notifications and save
			const unread = updated.filter((notif) => !notif.read);
			localStorage.setItem("pawpal_notifications", JSON.stringify(unread));
			return unread;
		});
	}

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("hr-HR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<>
			<Navbar />
			<main className="inbox-content">
				<div className="inbox-container">
					<div className="inbox-header">
						<h1 className="inbox-title">Sandučić</h1>
					</div>

					<div className="inbox-settings">
						<div className="notif-toggle-card">
							<div className="notif-toggle-label">
								<span>Uključi obavijesti</span>
								<span className="notif-toggle-hint">
									{notifOn ? "Obavijesti su uključene" : "Obavijesti su isključene"}
								</span>
							</div>
							<label className="notif-toggle">
								<input
									type="checkbox"
									checked={notifOn}
									onChange={handleToggleNotifications}
								/>
								<span className="toggle-ui"></span>
							</label>
						</div>
					</div>

					<div className="notifications-section">
						<h2 className="notifications-title">Obavijesti</h2>
						{loading ? (
							<div className="notifications-empty">Učitavanje...</div>
						) : notifications.length === 0 ? (
							<div className="notifications-empty">
								Još nema obavijesti. Kada se novi šetači registriraju, pojavit će se ovdje.
							</div>
						) : (
							<div className="notifications-list">
								{notifications.map((notif) => (
									<div key={notif.id} className="notification-item">
										<div className="notification-content">
											<div className="notification-message">{notif.message}</div>
											<div className="notification-time">{formatDate(notif.created_at)}</div>
										</div>
										<button
											className="notification-mark-read"
											onClick={() => handleMarkAsRead(notif.id)}
											aria-label="Označi kao pročitano"
											title="Označi kao pročitano"
										>
											✓
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</main>
		</>
	);
}
