import { api } from "../api/client"; // prilagodi path

// login
await api.login(email, password);

// register
await api.register({ email, first_name, last_name, password, is_walker });

// me
const user = await api.me();

// logout
await api.logout();
setUser(null);
window.location.href = "/";
