// src/api/client.js

// baza URL-a prema backendu (Render)
const BASE = import.meta.env.VITE_API_BASE_URL || "";
console.log("API BASE =", BASE);

// helper za JSON + error handling
async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // ovdje možeš dodatno logirati ako želiš
    throw data;
  }
  return data;
}

// CSRF token držimo u JS varijabli (ne u cookieju)
let csrfToken = null;

// 1) dohvat CSRF tokena iz /api/auth/csrf/
export async function ensureCsrf() {
  if (csrfToken) return; // već smo ga dohvatili

  const res = await fetch(`${BASE}/api/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  csrfToken = data.csrfToken;
}

// 2) helper za POST s CSRF headerom
async function post(path, body) {
  await ensureCsrf(); // pobrini se da imamo token

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(body ?? {}),
  });

  return json(res);
}

// 3) helper za GET (bez CSRF, nije potreban)
async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    credentials: "include",
  });
  return json(res);
}

// 4) public API koji koristiš po appu
export const api = {
  // /api/auth/me/ -> vrati user objekt ili null
  me: async () => {
    const data = await get("/api/auth/me/");
    return data.authenticated ? data.user : null;
  },

  // register
  register: ({ email, first_name, last_name, password, is_walker }) =>
    post("/api/auth/register/", {
      email,
      first_name,
      last_name,
      password,
      is_walker,
    }),

  // login
  login: (email, password) =>
    post("/api/auth/login/", { email, password }),

  // logout – bez CSRF, backend ima @csrf_exempt
  logout: async () => {
    const res = await fetch(`${BASE}/api/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });
    return res.json().catch(() => ({}));
  },

  // primjer za nešto drugo, ostavi ako koristiš
  toggleNotifications: () => post("/api/notifications/toggle/", {}),

  // Google login URL helper
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
