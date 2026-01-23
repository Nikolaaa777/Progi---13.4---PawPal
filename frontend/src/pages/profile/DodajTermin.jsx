import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/addTermin.css";

const DodajTermin = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [walkType, setWalkType] = useState("individualna");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Combine date and time into ISO datetime string with timezone
      // Use local timezone offset
      const dateTime = `${date}T${time}:00`;
      
      // Convert duration from minutes to PostgreSQL interval format
      // Format: HH:MM:SS or use timedelta format
      const durationMinutes = parseInt(duration);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        setError("Trajanje mora biti pozitivan broj");
        setLoading(false);
        return;
      }
      
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      // PostgreSQL interval format: HH:MM:SS
      const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      
      // Convert price to cents (multiply by 100)
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setError("Cijena mora biti pozitivan broj");
        setLoading(false);
        return;
      }
      const priceInCents = Math.round(priceValue * 100);
      
      // Convert walk type: individualna = 1, grupna = 2
      const tipSetnje = walkType === "individualna" ? 1 : 2;

      const response = await api.createWalk({
        terminSetnje: dateTime,
        trajanjeSetnje: durationStr,
        cijenaSetnje: priceInCents,
        tipSetnje: tipSetnje,
        gradSetnje: location,
      });

      if (response.success === 1 || response.idSetnje) {
        alert("Termin uspješno dodan!");
        navigate(-1);
      } else {
        setError(response.message || "Failed to create walk appointment");
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating the walk");
      console.error("Error creating walk:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <main className="content add-termin-content">
        <div className="add-termin-card">
          <h1 className="add-termin-title">Dodaj novi termin</h1>

          <form className="add-termin-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{ 
                padding: "12px", 
                background: "#fee2e2", 
                color: "#991b1b", 
                marginBottom: "16px", 
                borderRadius: "8px" 
              }}>
                {error}
              </div>
            )}
            
            {/* LOKACIJA - Optional field for future use */}
            <div className="form-group">
              <label>Lokacija (upiši grad)</label>
              <input
                type="text"
                placeholder="Unesite lokaciju"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* TIP ŠETNJE */}
            <div className="form-group">
              <label>Tip šetnje</label>

              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="walkType"
                    value="individualna"
                    checked={walkType === "individualna"}
                    onChange={(e) => setWalkType(e.target.value)}
                  />
                  Individualna
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="walkType"
                    value="grupna"
                    checked={walkType === "grupna"}
                    onChange={(e) => setWalkType(e.target.value)}
                  />
                  Grupna
                </label>
              </div>
            </div>

            {/* DATUM */}
            <div className="form-group">
              <label>Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* VRIJEME */}
            <div className="form-group">
              <label>Vrijeme</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            {/* TRAJANJE */}
            <div className="form-group">
              <label>Trajanje (minute)</label>
              <input
                type="number"
                min="10"
                step="5"
                placeholder="npr. 60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>

            {/* CIJENA */}
            <div className="form-group">
              <label>Cijena (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="npr. 20.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* ACTIONS */}
            <div className="add-termin-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate(-1)}
              >
                Odustani
              </button>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Dodavanje..." : "Dodaj termin"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DodajTermin;
