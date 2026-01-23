import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import "../styles/paymentModal.css";

const PaymentModal = ({ isOpen, onClose, reservationId, amount, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const cardMounted = useRef(false);

  /* ---------- LOAD STRIPE ---------- */
  useEffect(() => {
    if (paymentMethod !== "stripe") return;

    if (!window.Stripe) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [paymentMethod]);

  /* ---------- CLEANUP ---------- */
  useEffect(() => {
    return () => {
      if (cardElement) {
        cardElement.unmount();
        cardMounted.current = false;
      }
    };
  }, [cardElement]);

  /* ---------- CREATE PAYMENT ---------- */
  const handlePayment = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.createPaymentIntent({
        reservation_id: reservationId,
        amount: amount.toString(),
        payment_method: paymentMethod,
      });

      if (!res.success) {
        setError(res.error || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentMethod === "cash") {
        onSuccess(res);
        onClose();
        return;
      }

      if (paymentMethod === "paypal") {
        localStorage.setItem("payment_id", res.payment_id);
        window.location.href = res.approval_url;
        return;
      }

      if (paymentMethod === "stripe") {
        if (!res.publishable_key) {
          setError("Stripe not configured");
          setLoading(false);
          return;
        }

        setClientSecret(res.client_secret);
        setPaymentId(res.payment_id);

        const waitForStripe = setInterval(() => {
          if (window.Stripe && !cardMounted.current) {
            clearInterval(waitForStripe);

            const stripeInstance = window.Stripe(res.publishable_key);
            const elements = stripeInstance.elements();
            const card = elements.create("card");

            card.mount("#card-element");

            cardMounted.current = true;
            setStripe(stripeInstance);
            setCardElement(card);
            setLoading(false);
          }
        }, 100);
      }
    } catch (err) {
      setError("Payment error");
      setLoading(false);
    }
  };

  /* ---------- STRIPE CONFIRM ---------- */
  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !cardElement || !clientSecret) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElement } }
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      const confirm = await api.confirmStripePayment({
        payment_intent_id: paymentIntent.id,
        payment_id: paymentId,
      });

      if (confirm.success) {
        onSuccess(confirm);
        onClose();
      } else {
        setError("Stripe confirmation failed");
      }
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Odaberi način plaćanja</h2>

        {error && <div className="payment-error">{error}</div>}
        <div className="payment-amount">Iznos: {amount} €</div>

        <div className="payment-methods">
          {["cash", "paypal", "stripe"].map((m) => (
            <label key={m} className="payment-method">
              <input
                type="radio"
                checked={paymentMethod === m}
                onChange={() => setPaymentMethod(m)}
              />
              {m === "cash" ? "Gotovina" : m === "paypal" ? "PayPal" : "Kartica"}
            </label>
          ))}
        </div>

        {paymentMethod === "stripe" && clientSecret && (
          <form className="stripe-form" onSubmit={handleStripeSubmit}>
            <div id="card-element" />
            <button className="btn primary" disabled={loading}>
              {loading ? "Plaćanje..." : "Plati karticom"}
            </button>
          </form>
        )}

        {paymentMethod !== "stripe" && (
          <button className="btn primary" onClick={handlePayment} disabled={loading}>
            {loading ? "Učitavanje..." : "Plati"}
          </button>
        )}

        <button className="btn secondary" onClick={onClose}>
          Odustani
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
