import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { api } from "./api/client";
import ProfileInfo from "./pages/profile/ProfileInfo";
import MojiLjubimci from "./pages/profile/MojiLjubimci";
import MojeRezervacije from "./pages/profile/MojeRezervacije";
import ProfileLayout from "./pages/profile/ProfileLayout";
import UrediProfil from "./pages/profile/UrediProfil";
import DodajPsa from "./pages/profile/DodajPsa";
import UrediPsa from "./pages/profile/UrediPsa";
import MojiTermini from "./pages/profile/MojiTermini";
import ZahtjeviZaSetnju from "./pages/profile/ZahtjeviZaSetnju";	

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
    </Routes>
  );
}


/* <Route path="termini" element={<MojiTermini />} />
import MojiTermini from "./pages/profile/MojiTermini";
import ZahtjeviZaSetnju from "./pages/profile/ZahtjeviZaSetnju";*/