import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
      console.error("Failed to load dogs:", err);
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm("Jeste li sigurni da želite otkazati ovu rezervaciju?")) {
      return;
    }
    try {
      await api.deleteReservation(reservationId);
      loadReservations();
    } catch (err) {
      alert(err.message || "Failed to delete reservation");
    }
  };

  const handlePayment = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (response) => {
    alert("Plaćanje uspješno!");
    setShowPaymentModal(false);
    loadReservations();
  };

  const handleChat = (reservationId) => {
    navigate(`/chat?reservationId=${reservationId}`);
  };

  const getStatus = (reservation) => {
    if (reservation.odradena) return "Završena";
    if (reservation.potvrdeno === true) return "Potvrđena";
    if (reservation.potvrdeno === false) return "Odbijena";
    return "Na čekanju";
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();

    if (s.includes("zavr")) return "zavrsena";
    if (s.includes("otkaz") || s.includes("odbij")) return "otkazana";
    if (s.includes("plan") || s.includes("čekanju")) return "planirana";
    if (s.includes("potvr")) return "aktivna";

    return "";
  };

  const statusOrder = {
    zavrsena: 1,
    planirana: 2,
    aktivna: 3,
    otkazana: 4,
  };

  const sortedRezervacije = [...rezervacije].sort((a, b) => {
    const statusA = getStatusClass(getStatus(a));
    const statusB = getStatusClass(getStatus(b));

    return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
  });

  if (loading) {
    return (
      <div className="app">
        <main className="content">
          <h1 className="page-title">Moje rezervacije</h1>
          <div style={{ padding: "40px", textAlign: "center" }}>Učitavanje...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Moje rezervacije</h1>

        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", marginBottom: "16px", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <div className="Walk-Reservations">
          <div className="Walk-Reservations__inner">
            {sortedRezervacije.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                Nema rezervacija
              </div>
            ) : (
              sortedRezervacije.map((r) => {
                const status = getStatus(r);
                const statusClass = getStatusClass(status);
                const isConfirmed = r.potvrdeno;
                const isCompleted = r.odradena;

                return (
                  <div key={r.idRezervacije} className="Walk-Reservation-card">
                    <div className="Walk-Reservation-left">
                      <div className="Walk-calendar">
                        <img src="/calendar.png" alt="calendar" />
                      </div>

                      <div className="Walk-Reservation-text">
                        <div className="Walk-Reservation-date">
                          Rezervacija #{r.idRezervacije}
                        </div>

                        <div className="Walk-Reservation-info">
                          Pas: {r.dog_name || dogs[r.idPsa] || `ID: ${r.idPsa}`}
                        </div>

                        <div className="Walk-Reservation-info">
                          Šetač: {r.walker_name || "N/A"}
                        </div>

                        {r.walk_details?.cijenaSetnje && (
                          <div className="Walk-Reservation-info">
                            Cijena: {r.walk_details.cijenaSetnje.toFixed(2)} €
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="iconsWalk">
                      <div className={`Walk-status-reservation ${statusClass}`}>
                        {status}
                      </div>

                      {isCompleted && r.walk_details?.cijenaSetnje && (
                        <button
                          className="payReservation-btn"
                          onClick={() => handlePayment(r)}
                        >
                          Plaćanje
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          className="chatReservation-btn"
                          onClick={() => handleChat(r.idRezervacije)}
                          title="Otvori razgovor"
                        >
                          <img src="/msg.png" alt="msg" />
                        </button>
                      )}

                      <button
                        className="deleteReservation-btn"
                        onClick={() => handleDelete(r.idRezervacije)}
                        title="Otkazi rezervaciju"
                      >
                        <img src="/bin.png" alt="trash" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {showPaymentModal && selectedReservation && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            reservationId={selectedReservation.idRezervacije}
            amount={selectedReservation.walk_details?.cijenaSetnje || 20.0}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </main>
    </div>
  );
};

export default MojeRezervacije;
