const BASE = import.meta.env.VITE_API_BASE_URL || "";

console.log("API BASE =", BASE);

let csrfToken = null;

export async function ensureCsrf() {
  // UVIJEK osvježi CSRF token prije POST-a
  const res = await fetch(`${BASE}/api/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  csrfToken = data.csrfToken;
}

// generic helper for JSON responses
async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data;
}

// POST helper that automatically attaches CSRF header
async function post(path, body = {}) {
  await ensureCsrf();

  return jsonFetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(body),
  });
}

// GET helper (no CSRF header needed)
async function get(path) {
  return jsonFetch(`${BASE}${path}`, {
    method: "GET",
  });
}

export const api = {
  // vrati user objekt ili null
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

  // logout je CSRF-exempt na backendu, zato bez CSRF headera
  logout: async () => {
    try {
      return await jsonFetch(`${BASE}/api/auth/logout/`, {
        method: "POST",
      });
    } catch (err) {
      return err.data || {};
    }
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
