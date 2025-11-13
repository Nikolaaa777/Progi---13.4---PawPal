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
};
