import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import PaymentModal from "../../components/PaymentModal";
import "../../styles/rezervacije.css";

const MojeRezervacije = () => {
  const navigate = useNavigate();

  const [rezervacije, setRezervacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [dogs, setDogs] = useState({});

  useEffect(() => {
    loadReservations();
    loadDogs();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await api.getMyReservations();
      if (response.success) {
        setRezervacije(response.data || []);
      } else {
        setError(response.message || "Failed to load reservations");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadDogs = async () => {
    try {
      const dogsData = await api.dogs();
      const dogsMap = {};
      dogsData.forEach((dog) => {
        dogsMap[dog.idPsa] = dog.imePsa;
      });
      setDogs(dogsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Jeste li sigurni?")) return;
    await api.deleteReservation(id);
    loadReservations();
  };

  const handlePayment = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    loadReservations();
  };

  const handleReview = (reservationId) => {
    navigate(`/ocijeni/${reservationId}`);
  };

  const handleChat = (id) => {
    navigate(`/chat?reservationId=${id}`);
  };

  const getStatus = (r) => {
    if (r.odradena) return "Završena";
    if (r.potvrdeno === true) return "Potvrđena";
    if (r.potvrdeno === false) return "Odbijena";
    return "Na čekanju";
  };

  const getStatusClass = (status) => {
    if (status.includes("Zavr")) return "zavrsena";
    if (status.includes("Odb")) return "otkazana";
    if (status.includes("ček")) return "planirana";
    if (status.includes("Potv")) return "aktivna";
    return "";
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Učitavanje...</div>;
  }

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Moje rezervacije</h1>

        {error && <div className="error">{error}</div>}

        {rezervacije.map((r) => {
          const status = getStatus(r);
          const statusClass = getStatusClass(status);
          const isCompleted = r.odradena;
          const isPaid = r.payment_status === "COMPLETED";

          return (
            <div key={r.idRezervacije} className="Walk-Reservation-card">
              <div className="Walk-Reservation-left">
                <div className="Walk-calendar">
                  <img src="/calendar.png" alt="" />
                </div>

                <div className="Walk-Reservation-text">
                  <div>Rezervacija #{r.idRezervacije}</div>
                  <div>Pas: {dogs[r.idPsa]}</div>
                  <div>Šetač: {r.walker_name}</div>
                  <div>
                    Cijena: {r.walk_details?.cijenaSetnje?.toFixed(2)} €
                  </div>
                </div>
              </div>

              <div className="iconsWalk">
                <div className={`Walk-status-reservation ${statusClass}`}>
                  {status}
                </div>

                {isCompleted && (
                  isPaid ? (
                    <button
                      className="reviewReservation-btn"
                      onClick={() => handleReview(r.idRezervacije)}
                    >
                      Ocijeni
                    </button>
                  ) : (
                    <button
                      className="payReservation-btn"
                      onClick={() => handlePayment(r)}
                    >
                      Plati
                    </button>
                  )
                )}

                {r.potvrdeno && (
                  <button
                    className="chatReservation-btn"
                    onClick={() => handleChat(r.idRezervacije)}
                  >
                    💬
                  </button>
                )}

                <button
                  className="deleteReservation-btn"
                  onClick={() => handleDelete(r.idRezervacije)}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}

        {showPaymentModal && selectedReservation && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            reservationId={selectedReservation.idRezervacije}
            amount={selectedReservation.walk_details?.cijenaSetnje}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </main>
    </div>
  );
};

export default MojeRezervacije;
