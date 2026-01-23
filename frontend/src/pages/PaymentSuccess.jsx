import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Potvrđujem plaćanje...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token"); // PayPal order_id
        const paymentIdParam = urlParams.get("payment_id");

        if (!token || !paymentIdParam) {
          setError("Nedostaje token ili payment_id u URL-u.");
          setMsg(null);
          return;
        }

        const res = await api.confirmPayPalPayment({
          order_id: token,
          payment_id: parseInt(paymentIdParam, 10),
        });

        if (res?.success) {
          setMsg("Plaćanje uspješno! Preusmjeravam...");
          setTimeout(() => {
            navigate("/profile/rezervacije");
          }, 900);
        } else {
          setError(res?.error || "Payment confirmation failed");
          setMsg(null);
        }
      } catch (e) {
        setError(e?.data?.error || e?.message || "Došlo je do greške.");
        setMsg(null);
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="app">
      <main className="content" style={{ padding: 24 }}>
        <h1>Plaćanje</h1>
        {msg && <p>{msg}</p>}
        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px" }}>
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentSuccess;
