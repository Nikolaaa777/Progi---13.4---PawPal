import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/editTermin.css";

const UrediTermin = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [walkType, setWalkType] = useState("individualna");
  const [price, setPrice] = useState(""); 

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // expects api.walk(id) to exist
        const w = await api.walk(id);

        // terminSetnje -> date/time input
        if (w?.terminSetnje) {
          const dt = new Date(w.terminSetnje);
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, "0");
          const dd = String(dt.getDate()).padStart(2, "0");
          const hh = String(dt.getHours()).padStart(2, "0");
          const mi = String(dt.getMinutes()).padStart(2, "0");
          setDate(`${yyyy}-${mm}-${dd}`);
          setTime(`${hh}:${mi}`);
        }

        // location: prefer gradSetnje, fallback to city
        setLocation(w?.gradSetnje ?? w?.city ?? "");

        // tipSetnje: 1=Individualna, 2=Grupna
        setWalkType(String(w?.tipSetnje) === "2" ? "grupna" : "individualna");

        // trajanjeSetnje: "HH:MM:SS" -> minutes
        if (w?.trajanjeSetnje) {
          const s = String(w.trajanjeSetnje);
          const parts = s.split(":");
          if (parts.length >= 2) {
            const h = parseInt(parts[0], 10) || 0;
            const m = parseInt(parts[1], 10) || 0;
            setDuration(String(h * 60 + m));
          } else {
            const mins = parseInt(s, 10);
            if (!Number.isNaN(mins)) setDuration(String(mins));
          }
        }

        // cijenaSetnje is assumed stored as cents in DB -> show euros
        if (w?.cijenaSetnje !== undefined && w?.cijenaSetnje !== null) {
          const cents = Number(w.cijenaSetnje);
          if (!Number.isNaN(cents)) setPrice(String(cents));
        }
      } catch (e) {
        console.error(e);
        setErr("Ne mogu učitati termin.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      if (!date || !time) {
        setErr("Datum i vrijeme su obavezni.");
        return;
      }

      const mins = parseInt(duration, 10);
      if (Number.isNaN(mins) || mins < 10) {
        setErr("Trajanje mora biti barem 10 minuta.");
        return;
      }

      const priceNum = parseFloat(price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        setErr("Cijena nije ispravna.");
        return;
      }

      // minutes -> "HH:MM:SS"
      const hh = String(Math.floor(mins / 60)).padStart(2, "0");
      const mm = String(mins % 60).padStart(2, "0");
      const trajanjeSetnje = `${hh}:${mm}:00`;

      // "YYYY-MM-DDTHH:MM:SS"
      const terminSetnje = `${date}T${time}:00`;

      const tipSetnje = walkType === "grupna" ? 2 : 1;

      // euros -> cents
      const cijenaSetnje = Math.round(priceNum * 100);

      await api.updateWalk(id, {
        terminSetnje,
        trajanjeSetnje,
        tipSetnje,
        gradSetnje: location,
        cijenaSetnje,
      });

      alert("Termin uspješno uređen!");
      navigate(-1);
    } catch (e) {
      console.error(e);
      setErr("Greška pri spremanju termina.");
    }
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="app">
      <main className="content edit-termin-content">
        <div className="edit-termin-card">
          <h1 className="edit-termin-title">Uredi termin</h1>

          {err && <p style={{ color: "crimson" }}>{err}</p>}

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

            {/* CIJENA */}
            <div className="edit-form-group">
              <label>Cijena (€)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="npr. 10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
