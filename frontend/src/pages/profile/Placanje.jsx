import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/placanje.css";

const Placanje = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Plaćanje uspješno!");
    navigate("/profile/rezervacije");
  };

  return (
    <div className="app">
      <main className="content payment-content">
        <div className="payment-card">
          <div className="payment-header">
            <h1 className="payment-title">Plaćanje termina</h1>

            <div className="payment-summary">
              <h2>Sažetak termina</h2>

              <div className="summary-row">
                <span>Datum</span>
                <span>28.01.2026 · 13:30</span>
              </div>

              <div className="summary-row">
                <span>Pas</span>
                <span>Rex</span>
              </div>

              <div className="summary-row">
                <span>Trajanje</span>
                <span>60 min</span>
              </div>

              <div className="summary-row total">
                <span>Ukupno</span>
                <span>20 €</span>
              </div>
            </div>

            <form className="payment-form" onSubmit={handleSubmit}>
              <h2>Podatci o kartici</h2>

              <div className="card-fields">
                <input
                  type="text"
                  placeholder="Broj kartice"
                  required
                />

                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    required
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    required
                  />
                </div>
              </div>
              <div className="payment-actions">
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => navigate(-1)}
                >
                  Zatvori
                </button>

                <button type="submit" className="pay-btn">
                  Plati
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Placanje;
