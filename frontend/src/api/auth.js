const API = import.meta.env.VITE_API_BASE_URL;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export async function initCsrf() {
  await fetch(`${API}/api/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });
}

export async function registerUser({ email, first_name, last_name, password, is_walker }) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API}/api/auth/register/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
    body: JSON.stringify({ email, first_name, last_name, password, is_walker }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status !== 201) throw new Error(data?.message || JSON.stringify(data));
  return data;
}

export async function login(email, password) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API}/api/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Login failed");
  return data;
}

export async function me() {
  const res = await fetch(`${API}/api/auth/me/`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
}

export async function logout() {
<<<<<<< HEAD
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(`${API}/api/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRFToken": csrftoken },
  });
  return res.json();
}
=======
  const res = await fetch(`${API}/api/auth/logout/`, {
    method: "POST",
    credentials: "include",
  });

  try {
    return await res.json();
  } catch {
    return {};
  }
}
>>>>>>> frontend
