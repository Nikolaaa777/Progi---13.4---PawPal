import React, { useState, useEffect } from "react";
import { api } from "../../api/client";
import { useNavigate } from "react-router-dom";
import "../../styles/zahtjevi.css";

const ZahtjeviZaSetnju = () => {
  const navigate = useNavigate();
  const [zahtjevi, setZahtjevi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getMyReservations();

      if (response.success) {
        // ✅ PENDING = potvrdeno === null ONLY
        const pending = (response.data || []).filter(
          (r) => r.potvrdeno === null
        );
        setZahtjevi(pending);
      } else {
        setError(response.message || "Neuspješno učitavanje zahtjeva.");
      }
    } catch (err) {
      setError(err.message || "Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reservationId) => {
    if (!window.confirm("Jeste li sigurni da želite prihvatiti ovu rezervaciju?")) {
      return;
    }

    try {
      const response = await api.acceptReservation(reservationId);
      if (response.success) {
        alert("Rezervacija prihvaćena!");
        loadRequests();
      } else {
        alert(response.message || "Neuspješno prihvaćanje.");
      }
    } catch (err) {
      alert(err.message || "Greška.");
    }
  };

  const handleReject = async (reservationId) => {
    if (!window.confirm("Jeste li sigurni da želite odbiti ovu rezervaciju?")) {
      return;
    }

    try {
      const response = await api.rejectReservation(reservationId);
      if (response.success) {
        alert("Rezervacija odbijena.");
        loadRequests();
      } else {
        alert(response.message || "Neuspješno odbijanje.");
      }
    } catch (err) {
      alert(err.message || "Greška.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="app">
        <main className="content">
          <h1 className="page-title">Zahtjevi za šetnju</h1>
          <div style={{ padding: "40px", textAlign: "center" }}>
            Učitavanje...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Zahtjevi za šetnju</h1>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#fee2e2",
              color: "#991b1b",
              marginBottom: "16px",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <div className="Walk-Requests">
          <div className="Walk-Requests__inner">
            {zahtjevi.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Nema zahtjeva za šetnju
              </div>
            ) : (
              zahtjevi.map((z) => {
                const termin = z.walk_details?.terminSetnje;

                return (
                  <div key={z.idRezervacije} className="Walk-Request-card">
                    <div className="Walk-Request-left">
                      <div className="Walk-calendar">
                        <img src="/calendar.png" alt="calendar" />
                      </div>

                      <div className="Walk-Request-text">
                        <div className="Walk-Request-date">
                          {formatDate(termin)} · {formatTime(termin)}
                        </div>

                        <div className="Walk-Request-info">
                          Pas: {z.dog_name || `ID: ${z.idPsa}`}
                        </div>

                        {z.walk_details?.trajanjeSetnje && (
                          <div className="Walk-Request-info">
                            Trajanje: {z.walk_details.trajanjeSetnje}
                          </div>
                        )}

                        <div className="Walk-Request-info">
                          Vlasnik: {z.owner_name || "N/A"}
                        </div>

                        {z.walk_details?.cijenaSetnje && (
                          <div className="Walk-Request-info">
                            Cijena: {z.walk_details.cijenaSetnje.toFixed(2)} €
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="Request-buttons">
                      <button
                        className="accept-btn"
                        onClick={() => handleAccept(z.idRezervacije)}
                      >
                        Prihvati
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(z.idRezervacije)}
                      >
                        Odbij
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ZahtjeviZaSetnju;
