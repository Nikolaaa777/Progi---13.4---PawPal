import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/editTermin.css";

const UrediTermin = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [walkType, setWalkType] = useState("individualna");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Termin uspješno uređen!");
    navigate(-1);
  };

  return (
    <div className="app">
      <main className="content edit-termin-content">
        <div className="edit-termin-card">
          <h1 className="edit-termin-title">Uredi termin</h1>
          <form className="edit-termin-form" onSubmit={handleSubmit}>
            
            {/* LOKACIJA */}
            <div className="edit-form-group">
              <label>Lokacija</label>
              <input
                type="text"
                placeholder="Unesite lokaciju"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* TIP ŠETNJE */}
            <div className="edit-form-group">
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

                <label className="edit-radio-option">
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
            <div className="edit-form-group">
              <label>Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* VRIJEME */}
            <div className="edit-form-group">
              <label>Vrijeme</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            {/* TRAJANJE */}
            <div className="edit-form-group">
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

            {/* ACTIONS */}
            <div className="edit-termin-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate(-1)}
              >
                Odustani
              </button>

              <button type="submit" className="save-btn">
                Spremi promjene
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UrediTermin;
