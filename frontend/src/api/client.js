//const BASE = import.meta.env.VITE_API_BASE_URL || "";
const BASE = import.meta.env.VITE_API_BASE_URL || "https://progi-13-4-pawpal.onrender.com";

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
  console.log("api.me response:", data);

  // slučaj 1: backend vraća { authenticated: true/false, user: {...} | null }
  if (typeof data.authenticated !== "undefined") {
    return data.authenticated ? data.user : null;
  }

  // slučaj 2: backend vraća direktno user objekt { id, email, ... }
  if (data && (data.id || data.email)) {
    return data;
  }

  // u svim ostalim slučajevima tretiraj kao nelogiranog
  return null;
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

logout: async () => {
  try {
    return await post("/api/auth/logout/", {});
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
