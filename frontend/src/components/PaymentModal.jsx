import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import "../styles/paymentModal.css";

const PaymentModal = ({ isOpen, onClose, reservationId, amount, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripePublishableKey, setStripePublishableKey] = useState(null);

  useEffect(() => {
    if (paymentMethod === "stripe" && !window.Stripe) {
      // Load Stripe.js
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [paymentMethod]);

  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    if (!stripeInstance || !cardElement || !stripeClientSecret || !paymentId) {
      setError("Stripe not initialized");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } =
        await stripeInstance.confirmCardPayment(stripeClientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      } else if (paymentIntent.status === "succeeded") {
        // Confirm payment with backend
        const confirmResponse = await api.confirmStripePayment({
          payment_intent_id: paymentIntent.id,
          payment_id: paymentId,
        });

        if (confirmResponse.success) {
          onSuccess(confirmResponse);
          onClose();
        } else {
          setError(confirmResponse.error || "Payment confirmation failed");
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!reservationId || !amount) {
      setError("Missing reservation ID or amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === "cash") {
        // Cash payment - directly create and complete
        const response = await api.createPaymentIntent({
          reservation_id: reservationId,
          amount: amount.toString(),
          payment_method: "cash",
        });

        if (response.success) {
          onSuccess(response);
          onClose();
        } else {
          setError(response.error || "Payment failed");
        }
      } else if (paymentMethod === "paypal") {
        // PayPal payment
        const response = await api.createPaymentIntent({
          reservation_id: reservationId,
          amount: amount.toString(),
          payment_method: "paypal",
        });

        if (response.success && response.approval_url) {
          setPaymentId(response.payment_id);
          // Redirect to PayPal
          window.location.href = response.approval_url;
        } else {
          setError(response.error || "Failed to create PayPal payment");
        }
      } else if (paymentMethod === "stripe") {
        // Stripe payment
        const response = await api.createPaymentIntent({
          reservation_id: reservationId,
          amount: amount.toString(),
          payment_method: "stripe",
        });

        if (response.success && response.client_secret) {
          setPaymentId(response.payment_id);
          setStripeClientSecret(response.client_secret);
          setStripePublishableKey(response.publishable_key);

          // Initialize Stripe after a short delay to ensure script is loaded
          setTimeout(() => {
            if (window.Stripe) {
              const stripe = window.Stripe(response.publishable_key);
              setStripeInstance(stripe);

              const elements = stripe.elements();
              const card = elements.create("card");
              card.mount("#card-element");
              setCardElement(card);
            } else {
              setError("Stripe.js not loaded. Please refresh the page.");
            }
          }, 100);
        } else {
          setError(response.error || "Failed to create Stripe payment");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle PayPal return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const paymentIdParam = urlParams.get("payment_id");

    if (token && paymentIdParam && isOpen) {
      const confirmPayPal = async () => {
        try {
          const response = await api.confirmPayPalPayment({
            order_id: token,
            payment_id: parseInt(paymentIdParam),
          });

          if (response.success) {
            onSuccess(response);
            onClose();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setError(response.error || "Payment confirmation failed");
          }
        } catch (err) {
          setError(err.message || "An error occurred");
        }
      };

      confirmPayPal();
    }
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Odaberi način plaćanja</h2>
          <button className="payment-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-modal-body">
          {error && <div className="payment-error">{error}</div>}

          <div className="payment-amount">
            <strong>Iznos: {amount} €</strong>
          </div>

          <div className="payment-methods">
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Gotovina</span>
            </label>

            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>PayPal</span>
            </label>

            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Kartica</span>
            </label>
          </div>

          {paymentMethod === "stripe" && (
            <form className="stripe-payment-form" id="stripe-payment-form" onSubmit={handleStripeSubmit}>
              <div id="card-element"></div>
              <div id="card-errors" role="alert"></div>
            </form>
          )}

          <div className="payment-modal-actions">
            <button
              className="payment-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Odustani
            </button>
            <button
              className="payment-submit-btn"
              onClick={paymentMethod === "stripe" ? undefined : handlePayment}
              type={paymentMethod === "stripe" ? "submit" : "button"}
              form={paymentMethod === "stripe" ? "stripe-payment-form" : undefined}
              disabled={loading}
            >
              {loading ? "Učitavanje..." : "Plati"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
