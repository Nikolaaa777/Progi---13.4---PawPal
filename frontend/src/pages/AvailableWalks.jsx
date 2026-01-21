import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import "../styles/walks.css";

const AvailableWalks = () => {
  const [filters, setFilters] = useState({ city: "", type: "" });
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedWalk, setSelectedWalk] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState("");

  useEffect(() => {
    loadWalks();
    loadDogs();
  }, []);

  const loadWalks = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailableWalks();
      if (response.success) {
        setWalks(response.data || []);
      } else {
        setError("Failed to load walks");
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
      setDogs(Array.isArray(dogsData) ? dogsData : []);
    } catch (err) {
      console.error("Failed to load dogs:", err);
    }
  };

  const handleBook = (walk) => {
    setSelectedWalk(walk);
    setShowReservationModal(true);
  };

  const handleReserve = async () => {
    if (!selectedDog) {
      alert("Molimo odaberite psa");
      return;
    }

    try {
      const response = await api.createReservationFromWalk(selectedWalk.idSetnje, {
        idPsa: parseInt(selectedDog),
      });

      if (response.success) {
        alert("Rezervacija uspješno kreirana! Čekajte potvrdu od šetača.");
        setShowReservationModal(false);
        setSelectedDog("");
        loadWalks(); // Reload to remove reserved walk
      } else {
        alert(response.message || response.errors || "Failed to create reservation");
      }
    } catch (err) {
      console.error("Reservation error:", err);
      let errorMsg = "Greška u validaciji podataka";
      
      // Try to extract error message from response
      // err is a Response object when thrown from json() function
      if (err && typeof err.json === 'function') {
        try {
          const errorData = await err.json();
          // Handle different error formats
          if (errorData.errors) {
            // If it's a dictionary of field errors, format them
            if (typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
              const errorMessages = Object.entries(errorData.errors)
                .map(([field, messages]) => {
                  const fieldName = field === 'idPsa' ? 'Pas' : field;
                  const msg = Array.isArray(messages) ? messages.join(', ') : messages;
                  return `${fieldName}: ${msg}`;
                })
                .join('\n');
              errorMsg = errorMessages || errorData.message || errorMsg;
            } else {
              errorMsg = Array.isArray(errorData.errors) 
                ? errorData.errors.join(', ') 
                : errorData.errors || errorData.message || errorMsg;
            }
          } else {
            errorMsg = errorData.message || errorData.error || errorMsg;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMsg = err.statusText || err.message || errorMsg;
        }
      } else if (err && err.message) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      alert(`Greška: ${errorMsg}`);
    }
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
    // Duration is in format like "01:00:00" (HH:MM:SS)
    const parts = duration.split(":");
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes} min`;
    }
    return duration;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "N/A";
    const priceNum = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(priceNum)) return "N/A";
    return `${priceNum.toFixed(2)} €`;
  };

  const filteredWalks = walks.filter(
    (w) =>
      (!filters.city || w.location === filters.city) &&
      (!filters.type || w.type === filters.type)
  );

  if (loading) {
    return (
      <div className="availableWalks">
        <div style={{ padding: "40px", textAlign: "center" }}>Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="availableWalks">
      <aside className="availableWalks__filters">
        <h3>Filteri</h3>

        <label>Grad</label>
        <select onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
          <option value="">Svi</option>
          <option value="Trešnjevka">Trešnjevka</option>
          <option value="Maksimir">Maksimir</option>
        </select>

        <label>Tip šetnje</label>
        <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">Svi</option>
          <option value="Individual">Individualna</option>
          <option value="Group">Grupna</option>
        </select>
      </aside>

      <section className="availableWalks__list">
        <h1 className="availableWalks__title">Dostupne šetnje</h1>

        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", marginBottom: "16px", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        {filteredWalks.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            {walks.length === 0 
              ? "Nema dostupnih šetnji. Šetači mogu kreirati nove termine u profilu."
              : "Nema šetnji koje odgovaraju filterima."}
          </div>
        ) : (
          filteredWalks.map((w) => (
            <div key={w.idSetnje} className="availableWalks__card">
              <div className="availableWalks__left">
                <div className="availableWalks__calendar">
                  <img src="/calendar.png" alt="calendar" style={{ width: "24px", height: "24px" }} />
                </div>

                <div>
                  <div className="availableWalks__date">
                    {formatDate(w.terminSetnje)} · {formatTime(w.terminSetnje)}
                  </div>
                  <div className="availableWalks__info">
                    Trajanje: {formatDuration(w.trajanjeSetnje)}
                  </div>
                  <div className="availableWalks__info">
                    Šetač: {w.walker_name || "N/A"}
                  </div>
                  {w.cijenaSetnje && (
                    <div className="availableWalks__info">
                      Cijena: {formatPrice(w.cijenaSetnje)}
                    </div>
                  )}
                </div>
              </div>

              <div className="availableWalks__actions">
                {w.tipSetnje && (
                  <span className="availableWalks__badge">
                    {w.tipSetnje === 1 ? "Individualna" : "Grupna"}
                  </span>
                )}
                <button className="availableWalks__book" onClick={() => handleBook(w)}>
                  Rezerviraj
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {showReservationModal && selectedWalk && (
        <div className="modal-overlay" onClick={() => setShowReservationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Rezerviraj šetnju</h2>
            <div style={{ marginBottom: "16px" }}>
              <p><strong>Datum:</strong> {formatDate(selectedWalk.terminSetnje)}</p>
              <p><strong>Vrijeme:</strong> {formatTime(selectedWalk.terminSetnje)}</p>
              <p><strong>Šetač:</strong> {selectedWalk.walker_name}</p>
              {selectedWalk.cijenaSetnje && (
                <p><strong>Cijena:</strong> {formatPrice(selectedWalk.cijenaSetnje)}</p>
              )}
            </div>
            <label>
              <strong>Odaberi psa:</strong>
              <select
                value={selectedDog}
                onChange={(e) => setSelectedDog(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "8px", borderRadius: "6px" }}
              >
                <option value="">-- Odaberi psa --</option>
                {dogs.map((dog) => (
                  <option key={dog.idPsa} value={dog.idPsa}>
                    {dog.imePsa || `Pas #${dog.idPsa}`}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={() => setShowReservationModal(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Odustani
              </button>
              <button
                onClick={handleReserve}
                disabled={!selectedDog}
                style={{
                  padding: "10px 20px",
                  background: selectedDog ? "#3b76ff" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selectedDog ? "pointer" : "not-allowed",
                }}
              >
                Rezerviraj
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
        }
      `}</style>
    </div>
  );
};

export default AvailableWalks;
