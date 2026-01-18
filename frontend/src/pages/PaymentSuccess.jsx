import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const paymentId = searchParams.get("payment_id");

    if (token && paymentId) {
      // Confirm PayPal payment
      api.confirmPayPalPayment(token, paymentId)
        .then((response) => {
          if (response.success) {
            setPayment(response.payment);
          } else {
            setError(response.error || "Payment confirmation failed");
          }
        })
        .catch((err) => {
          setError(err.data?.error || "An error occurred");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("Missing payment information");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Processing payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444" }}>Payment Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ 
        background: "#d1fae5", 
        padding: "24px", 
        borderRadius: "8px",
        marginBottom: "24px"
      }}>
        <h2 style={{ color: "#065f46" }}>Payment Successful!</h2>
        {payment && (
          <div style={{ marginTop: "16px" }}>
            <p><strong>Payment ID:</strong> {payment.idPlacanja}</p>
            <p><strong>Amount:</strong> ${parseFloat(payment.cijenaSetnje).toFixed(2)}</p>
            <p><strong>Status:</strong> {payment.payment_status}</p>
          </div>
        )}
      </div>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 24px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Go Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
