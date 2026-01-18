import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentExample from "./pages/PaymentExample";
import PaymentSuccess from "./pages/PaymentSuccess";
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
      <Route path="/payment-example" element={<PaymentExample />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/chat" element={<Chat user={user} setUser={setUser} />} />
    </Routes>
  );
}
