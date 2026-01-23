import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PayPalSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = params.get("token");
    const paymentId = localStorage.getItem("payment_id");

    if (!orderId || !paymentId) {
      navigate("/placanje");
      return;
    }

    fetch("/api/payments/paypal/confirm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        order_id: orderId,
        payment_id: paymentId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Capture failed");
        return res.json();
      })
      .then(() => {
        localStorage.removeItem("payment_id");
        navigate("/profile/rezervacije");
      })
      .catch(() => {
        navigate("/payment-failed");
      });
  }, []);

  return <p>Confirming PayPal payment…</p>;
}
