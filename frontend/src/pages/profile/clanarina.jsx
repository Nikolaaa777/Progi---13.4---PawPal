import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/clanarina.css";

const Clanarina = () => {
  const navigate = useNavigate();

  const handlePay = (e) => {
    e.preventDefault();
    alert("Članarina uspješno plaćena!");
  };

  return (
    <div className="app">
      <main className="content clanarina-content">
        <div className="clanarina-card">
          <h1 className="clanarina-title">Članarina</h1>

          {/* STATUS */}
          <div className="clanarina-status">
            <div>
              <span>Status</span>
              <strong className="active">Aktivna</strong>
            </div>

            <div>
              <span>Vrijedi do</span>
              <strong>31.01.2026</strong>
            </div>

            <div>
              <span>Iznos</span>
              <strong>35 € / mj</strong>
            </div>
          </div>

          {/* PAYMENT */}
          <form className="clanarina-form" onSubmit={handlePay}>
            <h2>Plaćanje članarine</h2>

            <input
              type="text"
              placeholder="Broj kartice"
              required
            />

            <div className="clanarina-card-row">
              <input type="text" placeholder="MM/YY" required />
              <input type="text" placeholder="CVC" required />
            </div>

            <div className="clanarina-actions">
              <button type="submit" className="clanarina-pay-btn">
                Plati članarinu
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Clanarina;
