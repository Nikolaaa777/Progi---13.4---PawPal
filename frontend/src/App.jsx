import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Chat from "./pages/Chat";
import { api } from "./api/client";

export default function App() {
  const [user, setUser] = useState(null);

  // na mountu provjeri tko je logiran
  useEffect(() => {
    api
      .me()
      .then(setUser)        // api.me() vraća user ili null
      .catch(() => setUser(null));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} setUser={setUser} />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/register" element={<Register setUser={setUser} />} />
      
    </Routes>
  );
}
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
import ProfileLayout from "./pages/profile/ProfileLayout";
import UrediProfil from "./pages/profile/UrediProfil";
import DodajPsa from "./pages/profile/DodajPsa";
import UrediPsa from "./pages/profile/UrediPsa";
import MojiTermini from "./pages/profile/MojiTermini";
import ZahtjeviZaSetnju from "./pages/profile/ZahtjeviZaSetnju";
import AdminHome from "./pages/admin/AdminHome";
import ChatPage from "./pages/chat/ChatPage";
import PaymentExample from "./pages/PaymentExample";
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
				<Route path="rezervacije" element={<MojeRezervacije />} />
				<Route path="termini" element={<MojiTermini />} />
				<Route path="zahtjevi" element={<ZahtjeviZaSetnju />} />
			</Route>
			<Route path="/profile/ljubimci/:id/uredi" element={<UrediPsa />} />
			<Route path="/admin" element={<AdminHome />} />
			<Route path="/payment-example" element={<PaymentExample />} />
      		<Route path="/payment-success" element={<PaymentSuccess />} />
      		<Route path="/chat" element={<Chat user={user} setUser={setUser} />} />
		</Routes>
	);
}
