import React, { useState } from "react";
import { api } from "../api/client";
import "../styles/paymentModal.css";

const PaymentModal = ({ isOpen, onClose, reservationId, amount }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePayPal = async () => {
    if (!reservationId || !amount) {
      setError("Missing reservation ID or amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.createPaymentIntent({
        reservation_id: reservationId,
        amount: amount.toString(),
        payment_method: "paypal",
      });

      if (response?.success && response?.approval_url) {
        window.location.href = response.approval_url;
        return;
      }

      setError(response?.error || "Failed to create PayPal payment");
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Plaćanje (PayPal)</h2>
          <button className="payment-modal-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="payment-modal-body">
          {error && <div className="payment-error">{error}</div>}

          <div className="payment-amount">
            <strong>Iznos: {Number(amount).toFixed(2)} €</strong>
          </div>

          <div className="payment-modal-actions">
            <button className="payment-cancel-btn" onClick={onClose} disabled={loading}>
              Odustani
            </button>

            <button className="payment-submit-btn" onClick={handlePayPal} disabled={loading}>
              {loading ? "Preusmjeravam..." : "Plati PayPal-om"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
