// src/api/client.js

// URL backend API-ja (mora biti https://progi-13-4-pawpal.onrender.com u cloudu)
const BASE = import.meta.env.VITE_API_BASE_URL || "";
console.log("API BASE =", BASE);

// helper za JSON + error handling
async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("API error", res.status, data);
    throw data;
  }
  return data;
}

// ---------------- CSRF ----------------

let csrfToken = null;

// Dohvati CSRF token iz /api/auth/csrf/
export async function ensureCsrf() {
  if (csrfToken) return; // već ga imamo

  console.log("Fetching CSRF from", `${BASE}/api/auth/csrf/`);

  const res = await fetch(`${BASE}/api/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    console.error("CSRF fetch failed:", res.status);
    throw new Error("CSRF failed");
  }

  const data = await res.json().catch(() => ({}));
  csrfToken = data.csrfToken;
  console.log("CSRF token set:", csrfToken ? "OK" : "MISSING");
}

// ---------------- helperi ----------------

async function post(path, body) {
  await ensureCsrf();

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

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    credentials: "include",
  });
  return json(res);
}

// ---------------- public API ----------------

export const api = {
  // /api/auth/me/ -> user ili null
  me: async () => {
    const data = await get("/api/auth/me/");
    return data.authenticated ? data.user : null;
  },

  register: ({ email, first_name, last_name, password, is_walker }) =>
    post("/api/auth/register/", {
      email,
      first_name,
      last_name,
      password,
      is_walker,
    }),

  login: (email, password) =>
    post("/api/auth/login/", { email, password }),

  // logout: backend je @csrf_exempt, zato bez CSRF-a
  logout: async () => {
    const res = await fetch(`${BASE}/api/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });
    return res.json().catch(() => ({}));
  },

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
