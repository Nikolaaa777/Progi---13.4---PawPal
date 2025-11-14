import { api } from "../api/client";
// ...
await api.login(email, password);
await api.register(...);
await api.logout();
const user = await api.me();
