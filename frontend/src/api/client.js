const BASE = "";
const json = (res) => {
	if (!res.ok) throw res;
	return res.json().catch(() => ({}));
};

function getCookie(name) {
	return document.cookie
		.split("; ")
		.find((r) => r.startsWith(name + "="))
		?.split("=")[1];
}

export async function ensureCsrf() {
	await fetch(`${BASE}/api/auth/csrf/`, { credentials: "include" });
}

async function post(path, body) {
	await ensureCsrf();
	const csrf = getCookie("csrftoken");
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
	await ensureCsrf();
	const csrf = getCookie("csrftoken");
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
	await ensureCsrf();
	return json(await fetch(`${BASE}${path}`, { credentials: "include" }));
}

export const api = {
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
		try {
			const { url } = await res.json();
			return url;
		} catch {
			return res.url;
		}
	},

	// DOGS
	dogs: () => get("/api/dogs/"),
	dog: (idPsa) => get(`/api/dogs/${idPsa}/`),
	createDog: (payload) => post("/api/dogs/create/", payload),
	updateDog: async (idPsa, payload) => {
		await ensureCsrf();
		const csrf = getCookie("csrftoken");
		return json(
			await fetch(`${BASE}/api/dogs/${idPsa}/update/`, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": csrf,
				},
				body: JSON.stringify(payload),
			}),
		);
	},

	deleteDog: async (idPsa) => {
		await ensureCsrf();
		const csrf = getCookie("csrftoken");
		return json(
			await fetch(`${BASE}/api/dogs/${idPsa}/delete/`, {
				method: "DELETE",
				credentials: "include",
				headers: { "X-CSRFToken": csrf },
			}),
		);
	},

	// RESERVATIONS
	getMyReservations: () => get("/api/reservations/my-reservations/"),
	createReservation: (payload) => post("/api/reservations/create/", payload),
	createReservationFromWalk: (walkId, payload) => post(`/api/reservations/create-from-walk/${walkId}/`, payload),
	acceptReservation: (reservationId) => post(`/api/reservations/accept/${reservationId}/`, {}),
	rejectReservation: (reservationId) => post(`/api/reservations/reject/${reservationId}/`, {}),
	markWalkDone: (reservationId) => post(`/api/reservations/mark-done/${reservationId}/`, {}),
	deleteReservation: async (reservationId) => {
		await ensureCsrf();
		const csrf = getCookie("csrftoken");
		return json(
			await fetch(`${BASE}/api/reservations/delete/${reservationId}/`, {
				method: "DELETE",
				credentials: "include",
				headers: { "X-CSRFToken": csrf },
			}),
		);
	},

	// WALKS
	walk: (walkId) => get(`/api/walks/${walkId}/`),
	walks: () => get("/api/walks/"),
	getAvailableWalks: () => get("/api/walks/available/"),
	getAllWalks: () => get("/api/walks/fromAllWalkers/"),
	createWalk: (payload) => post("/api/walks/create/", payload),
	updateWalk: (walkId, payload) => patch(`/api/walks/${walkId}/update/`, payload),
	deleteWalk: async (walkId) => {
		await ensureCsrf();
		const csrf = getCookie("csrftoken");
		return json(
			await fetch(`${BASE}/api/walks/${walkId}/delete/`, {
				method: "DELETE",
				credentials: "include",
				headers: { "X-CSRFToken": csrf },
			}),
		);
	},

	// CHAT
	getConversations: () => get("/api/chat/conversations/"),
	getConversation: (conversationId) => get(`/api/chat/conversations/${conversationId}/`),
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
	adminClanarinaUpdate: (iznos) => patch("/api/admin/clanarina/update/", { iznos }),

};
