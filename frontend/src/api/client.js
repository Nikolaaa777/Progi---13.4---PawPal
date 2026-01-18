// Use empty string for relative URLs when behind Vite proxy, or absolute URL when set via env
const BASE = import.meta.env.VITE_API_BASE_URL || "";
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
	const url = BASE ? `${BASE}/api/auth/csrf/` : "/api/auth/csrf/";
	await fetch(url, { credentials: "include" });
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
		})
	);
}

async function get(path) {
	await ensureCsrf();
	return json(await fetch(`${BASE}${path}`, { credentials: "include" }));
}

export const api = {
	me: () => get("/api/auth/me/"),
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
		const url = BASE ? `${BASE}/api/auth/google/login-url/` : "/api/auth/google/login-url/";
		const res = await fetch(url, {
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
			})
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
			})
		);
	},

	// PAYMENTS
	createPaymentIntent: (payload) => post("/api/payments/create/", payload),
	confirmPayPalPayment: (payload) => post("/api/payments/paypal/confirm/", payload),
	confirmStripePayment: (payload) => post("/api/payments/stripe/confirm/", payload),
	getPaymentStatus: (paymentId) => get(`/api/payments/${paymentId}/`),
	getUserPayments: () => get("/api/payments/user/"),

	// CHAT
	getConversations: () => get("/api/chat/conversations/"),
	getConversation: (conversationId) => get(`/api/chat/conversations/${conversationId}/`),
	getOrCreateConversation: (userId) => post(`/api/chat/conversations/user/${userId}/`, {}),
	sendMessage: (payload) => post("/api/chat/messages/", payload),
	getUsers: () => get("/api/chat/users/"),
};
