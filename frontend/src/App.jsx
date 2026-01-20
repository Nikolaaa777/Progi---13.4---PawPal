import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { api } from "./api/client";
import AvailableWalks from "./pages/AvailableWalks";
import AvailableWalkers from "./pages/AvailableWalkers";
import ProfileInfo from "./pages/profile/ProfileInfo";
import MojiLjubimci from "./pages/profile/MojiLjubimci";
import MojeRezervacije from "./pages/profile/MojeRezervacije";
import Placanje from "./pages/profile/Placanje";
import ProfileLayout from "./pages/profile/ProfileLayout";
import UrediProfil from "./pages/profile/UrediProfil";
import DodajPsa from "./pages/profile/DodajPsa";
import UrediPsa from "./pages/profile/UrediPsa";
import MojiTermini from "./pages/profile/MojiTermini";
import DodajTermin from "./pages/profile/DodajTermin";
import UrediTermin from "./pages/profile/UrediTermin";
import ZahtjeviZaSetnju from "./pages/profile/ZahtjeviZaSetnju";
import Clanarina from "./pages/profile/clanarina";
import AdminHome from "./pages/admin/AdminHome";
import AdminKomentari from "./pages/admin/AdminKom";
import AdminKor from "./pages/admin/AdminKorisnici";
import ChatPage from "./pages/chat/ChatPage";
import PaymentSuccess from "./pages/PaymentSuccess";

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
			<Route path="/setnje" element={<AvailableWalks />} />
			<Route path="/setaci" element={<AvailableWalkers />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/profile" element={<ProfileLayout />}>
				<Route index element={<ProfileInfo />} />
				<Route path="uredi" element={<UrediProfil />} />
				<Route path="ljubimci" element={<MojiLjubimci />} />
				<Route path="ljubimci/dodaj" element={<DodajPsa />} />
				<Route path="ljubimci/:idPsa/uredi" element={<UrediPsa />} />
				<Route path="rezervacije" element={<MojeRezervacije />} />
				<Route path="rezervacije/placanje" element={<Placanje />} />
				<Route path="termini" element={<MojiTermini />} />
				<Route path="termini/dodaj" element={<DodajTermin />} />
				<Route path="termini/:id/uredi" element={<UrediTermin />} />
				<Route path="zahtjevi" element={<ZahtjeviZaSetnju />} />
				<Route path="clanarina" element={<Clanarina />} />
			</Route>
			<Route path="/admin" element={<AdminHome />} />
			<Route path="/adminKom" element={<AdminKomentari />} />
			<Route path="/adminKorisnici" element={<AdminKor />} />
      		<Route path="/payment-success" element={<PaymentSuccess />} />
      		<Route path="/chat" element={<ChatPage user={user} setUser={setUser} />} />
		</Routes>
	);
}
