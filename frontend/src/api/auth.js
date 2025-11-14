import { api, ensureCsrf } from "./client";

// Stari interface koji koriste tvoje komponente,
// ali sva prava logika (CSRF, URL-ovi) je u client.js.

export async function initCsrf() {
  await ensureCsrf();
}

export async function registerUser(args) {
  return api.register(args);
}

export async function login(email, password) {
  return api.login(email, password);
}

export async function me() {
  return api.me();
}

export async function logout() {
  return api.logout();
}
