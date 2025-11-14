// const BASE = "";
const BASE = import.meta.env.VITE_API_BASE_URL || "";
console.log("API BASE =", BASE);

const json = (res) => {
  if (!res.ok) throw res;
  return res.json().catch(() => ({}));
};

// CSRF token u modulu
let csrfToken = null;

// dohvat CSRF-a (isto kao u auth.js, ali za ovaj modul)
export async function ensureCsrf() {
  if (csrfToken) return;

  const res = await fetch(`${BASE}/api/auth/csrf/`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  csrfToken = data.csrfToken;
}

async function post(path, body) {
  await ensureCsrf(); // osiguraj token

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(body),
  });

  return json(res);
}

async function get(path) {
  // za GET nije nužan CSRF, ali neće škoditi ako ostavimo
  await ensureCsrf();
  return json(await fetch(`${BASE}${path}`, { credentials: "include" }));
}

export const api = {
  me: async () => {
    const data = await get("/api/auth/me/");
    return data.authenticated ? data.user : null;
  },
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
