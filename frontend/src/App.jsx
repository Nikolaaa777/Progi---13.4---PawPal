import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
