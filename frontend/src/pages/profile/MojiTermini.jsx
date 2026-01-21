import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/termini.css";

const MojiTermini = () => {
  const navigate = useNavigate();
  const [rezervacije, setRezervacije] = useState([]);
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(true); // true = show all, false = show only confirmed

  useEffect(() => {
    loadAppointments();
    loadMyWalks();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.getMyReservations();
      if (response.success) {
        // Filter only confirmed reservations (potvrdeno is true)
        const confirmed = (response.data || []).filter(
          (r) => r.potvrdeno === true
        );
        setRezervacije(confirmed);
      } else {
        setError(response.message || "Failed to load appointments");
      }
    } catch (err) {
      console.error("Error loading reservations:", err);
    }
  };

  const loadMyWalks = async () => {
    try {
      setLoading(true);
      const response = await api.walks();
      // Handle response format: could be {success: 1, data: [...]} or direct array
      if (response.success && response.data) {
        setWalks(response.data || []);
      } else if (Array.isArray(response)) {
        setWalks(response);
      } else if (response.data && Array.isArray(response.data)) {
        setWalks(response.data);
      } else {
        setWalks([]);
      }
    } catch (err) {
      console.error("Error loading walks:", err);
      setWalks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (reservationId) => {
    if (!window.confirm("Jeste li sigurni da je šetnja završena?")) {
      return;
    }

    try {
      const response = await api.markWalkDone(reservationId);
      if (response.success) {
        alert("Šetnja označena kao završena!");
        loadAppointments();
      } else {
        alert(response.message || "Failed to mark walk as done");
      }
    } catch (err) {
      alert(err.message || "An error occurred");
    }
  };

  const handleChat = (reservationId) => {
    navigate(`/chat?reservationId=${reservationId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    // Duration is in format like "01:00:00" (HH:MM:SS) or timedelta string
    if (typeof duration === 'string') {
      const parts = duration.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        if (hours > 0) {
          return `${hours}h ${minutes}min`;
        }
        return `${minutes} min`;
      }
    }
    return duration;
  };

  const getStatus = (reservation) => {
    if (reservation.odradena) return "Završen";
    return "Planiran";
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();

    if (s.includes("zavr")) return "zavrsen";
    if (s.includes("otkaz")) return "otkazan";
    return "planiran";
  };

  if (loading) {
    return (
      <div className="app">
        <main className="content">
          <h1 className="page-title">Moji termini</h1>
          <div style={{ padding: "40px", textAlign: "center" }}>Učitavanje...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Moji termini</h1>

        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", marginBottom: "16px", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => setShowAll(true)}
            style={{
              padding: "8px 16px",
              background: showAll ? "#3b76ff" : "#f3f4f6",
              color: showAll ? "white" : "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: showAll ? "600" : "400",
            }}
          >
            Svi termini
          </button>
          <button
            onClick={() => setShowAll(false)}
            style={{
              padding: "8px 16px",
              background: !showAll ? "#3b76ff" : "#f3f4f6",
              color: !showAll ? "white" : "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: !showAll ? "600" : "400",
            }}
          >
            Rezervirani ({rezervacije.length})
          </button>
        </div>

        <div className="Walk-Appointments">
          <div className="Walk-Appointments__inner">
            {showAll ? (
              // Show all created walks
              walks.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  Nema kreiranih termina. Kliknite "Dodaj termin" za kreiranje novog termina.
                </div>
              ) : (
                walks.map((walk) => {
                  const walkDate = walk.terminSetnje
                    ? formatDate(walk.terminSetnje)
                    : "N/A";
                  const walkTime = walk.terminSetnje
                    ? formatTime(walk.terminSetnje)
                    : "N/A";
                  const isReserved = walk.is_reserved;

                  return (
                    <div key={walk.idSetnje} className="Walk-Appointment-card">
                      <div className="Walk-Appointment-left">
                        <div className="Walk-calendar">
                          <img src="/calendar.png" alt="calendar" />
                        </div>

                        <div className="Walk-Appointment-text">
                          <div className="Walk-Appointment-date">
                            {walkDate} · {walkTime}
                          </div>

                          <div className="Walk-Appointment-info">
                            Trajanje: {formatDuration(walk.trajanjeSetnje)}
                          </div>

                          {walk.cijenaSetnje && (
                            <div className="Walk-Appointment-info">
                              Cijena: {typeof walk.cijenaSetnje === 'number' ? walk.cijenaSetnje.toFixed(2) : parseFloat(walk.cijenaSetnje || 0).toFixed(2)} €
                            </div>
                          )}

                          <div className="Walk-Appointment-info">
                            Tip: {walk.tipSetnje === 1 ? "Individualna" : walk.tipSetnje === 2 ? "Grupna" : "N/A"}
                          </div>

                          {isReserved && (
                            <div className="Walk-Appointment-info" style={{ color: "#10b981", fontWeight: "600" }}>
                              ✓ Rezervirano
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="iconsWalk">
                        <div className={`Walk-status-Appointment ${isReserved ? "aktivan" : "planiran"}`}>
                          {isReserved ? "Rezervirano" : "Dostupno"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Show only confirmed reservations
              rezervacije.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  Nema rezerviranih termina
                </div>
              ) : (
                rezervacije.map((r) => {
                const status = getStatus(r);
                const statusClass = getStatusClass(status);
                const isDone = r.odradena;
                const walkDate = r.walk_details?.terminSetnje
                  ? formatDate(r.walk_details.terminSetnje)
                  : "N/A";
                const walkTime = r.walk_details?.terminSetnje
                  ? formatTime(r.walk_details.terminSetnje)
                  : "N/A";

                return (
                  <div key={r.idRezervacije} className="Walk-Appointment-card">
                    <div className="Walk-Appointment-left">
                      <div className="Walk-calendar">
                        <img src="/calendar.png" alt="calendar" />
                      </div>

                      <div className="Walk-Appointment-text">
                        <div className="Walk-Appointment-date">
                          {walkDate} · {walkTime}
                        </div>

                        <div className="Walk-Appointment-info">
                          Pas: {r.dog_name || `ID: ${r.idPsa}`}
                        </div>

                        <div className="Walk-Appointment-info">
                          Vlasnik: {r.owner_name || "N/A"}
                        </div>

                        {r.walk_details?.trajanjeSetnje && (
                          <div className="Walk-Appointment-info">
                            Trajanje: {r.walk_details.trajanjeSetnje}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="iconsWalk">
                      <div className={`Walk-status-Appointment ${statusClass}`}>
                        {status}
                      </div>

                      {!isDone && (
                        <button
                          className="markDone-btn"
                          onClick={() => handleMarkDone(r.idRezervacije)}
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Završi
                        </button>
                      )}

                      <button
                        className="chatAppointment-btn"
                        onClick={() => handleChat(r.idRezervacije)}
                        title="Otvori razgovor"
                        style={{
                          background: "#f0fdf4",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                      >
                        💬
                      </button>
                    </div>
                  </div>
                );
              })
            ))}

            <NavLink
              to="/profile/termini/dodaj"
              className="addAppointment-btn"
            >
              Dodaj termin <img src="/plus.png" alt="plus" />
            </NavLink>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MojiTermini;
