const BASE = import.meta.env.VITE_API_BASE_URL || "https://progi-13-4-pawpal-3.onrender.com";


// CSRF token cache (works cross-domain because we read it from JSON, not cookies)
let CSRF_TOKEN = null;

const json = async (res) => {
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw { res, data };
	return data;
};

export async function ensureCsrf() {
	if (CSRF_TOKEN) return CSRF_TOKEN;

	const res = await fetch(`${BASE}/api/auth/csrf/`, { credentials: "include" });
	const data = await res.json().catch(() => ({}));
	CSRF_TOKEN = data.csrfToken || null;

	return CSRF_TOKEN;
}

async function post(path, body) {
	const csrf = await ensureCsrf();
	return json(
		await fetch(`${BASE}${path}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
			body: JSON.stringify(body),
		}),
	);
}

async function patch(path, body) {
	const csrf = await ensureCsrf();
	return json(
		await fetch(`${BASE}${path}`, {
			method: "PATCH",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": csrf,
			},
			body: JSON.stringify(body),
		}),
	);
}

async function get(path) {
	// CSRF not required for GET
	return json(await fetch(`${BASE}${path}`, { credentials: "include" }));
}

async function del(path) {
	const csrf = await ensureCsrf();
	return json(
		await fetch(`${BASE}${path}`, {
			method: "DELETE",
			credentials: "include",
			headers: { "X-CSRFToken": csrf },
		}),
	);
}

export const api = {
	// AUTH
	me: () => get("/api/auth/me/"),
	updateMe: (data) => patch("/api/auth/me/", data),
	login: (email, password) => post("/api/auth/login/", { email, password }),
	logout: () => post("/api/auth/logout/", {}),
	register: ({ email, first_name, last_name, password, is_walker }) =>
		post("/api/auth/register/", {
			email,
			first_name,
			last_name,
			password,
			is_walker,
		}),
	toggleNotifications: () => post("/api/notifications/toggle/", {}),

	googleLoginUrl: async () => {
		await ensureCsrf();
		const res = await fetch(`${BASE}/api/auth/google/login-url/`, {
			credentials: "include",
		});
		// response might be JSON { url: "..." } or redirect URL
		const data = await res.json().catch(() => null);
		if (data && data.url) return data.url;
		return res.url;
	},

	// DOGS
	dogs: () => get("/api/dogs/"),
	dog: (idPsa) => get(`/api/dogs/${idPsa}/`),
	createDog: (payload) => post("/api/dogs/create/", payload),
	updateDog: (idPsa, payload) => patch(`/api/dogs/${idPsa}/update/`, payload),
	deleteDog: (idPsa) => del(`/api/dogs/${idPsa}/delete/`),

	// RESERVATIONS
	getMyReservations: () => get("/api/reservations/my-reservations/"),
	createReservation: (payload) => post("/api/reservations/create/", payload),
	createReservationFromWalk: (walkId, payload) =>
		post(`/api/reservations/create-from-walk/${walkId}/`, payload),
	acceptReservation: (reservationId) =>
		post(`/api/reservations/accept/${reservationId}/`, {}),
	rejectReservation: (reservationId) =>
		post(`/api/reservations/reject/${reservationId}/`, {}),
	markWalkDone: (reservationId) =>
		post(`/api/reservations/mark-done/${reservationId}/`, {}),
	deleteReservation: (reservationId) =>
		del(`/api/reservations/delete/${reservationId}/`),

	// WALKS
	walk: (walkId) => get(`/api/walks/${walkId}/`),
	walks: () => get("/api/walks/"),
	getAvailableWalks: () => get("/api/walks/available/"),
	getAllWalks: () => get("/api/walks/fromAllWalkers/"),
	createWalk: (payload) => post("/api/walks/create/", payload),
	updateWalk: (walkId, payload) => patch(`/api/walks/${walkId}/update/`, payload),
	deleteWalk: (walkId) => del(`/api/walks/${walkId}/delete/`),

	// CHAT
	getConversations: () => get("/api/chat/conversations/"),
	getConversation: (conversationId) =>
		get(`/api/chat/conversations/${conversationId}/`),
	getOrCreateConversationFromReservation: (reservationId) =>
		post(`/api/chat/conversations/reservation/${reservationId}/`, {}),
	sendMessage: (payload) => post("/api/chat/messages/", payload),

	// PAYMENTS
	createPaymentIntent: (payload) => post("/api/payments/create/", payload),
	confirmPayPalPayment: (payload) => post("/api/payments/paypal/confirm/", payload),
	confirmStripePayment: (payload) => post("/api/payments/stripe/confirm/", payload),
	getPaymentStatus: (paymentId) => get(`/api/payments/${paymentId}/`),
	getUserPayments: () => get("/api/payments/user/"),

	// ADMIN
	adminUsersList: () => get("/api/admin/users/"),
	adminUserDisable: (userId) => patch(`/api/admin/users/${userId}/disable/`, {}),
	adminUserEnable: (userId) => patch(`/api/admin/users/${userId}/enable/`, {}),
	adminClanarinaGet: () => get("/api/admin/clanarina/"),
	adminClanarinaUpdate: (iznos) =>
		patch("/api/admin/clanarina/update/", { iznos }),
};
