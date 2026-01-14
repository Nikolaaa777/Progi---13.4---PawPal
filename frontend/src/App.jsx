import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { api } from "./api/client";
import ProfileInfo from "./pages/profile/ProfileInfo";
import MojiLjubimci from "./pages/profile/MojiLjubimci";
import MojeRezervacije from "./pages/profile/MojeRezervacije";

export default function App() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		api
			.me()
			.then(setUser)
			.catch(() => setUser(null));
	}, []);

	return (
		<Routes>
			<Route path="/" element={<Home user={user} />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/profile" element={<ProfileInfo />} />
			<Route path="/profile/ljubimci" element={<MojiLjubimci />} />
			<Route path="/profile/rezervacije" element={<MojeRezervacije />} />
		</Routes>
	);
}
