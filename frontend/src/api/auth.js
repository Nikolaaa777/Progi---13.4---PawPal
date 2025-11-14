import { api, ensureCsrf } from "./client";


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

