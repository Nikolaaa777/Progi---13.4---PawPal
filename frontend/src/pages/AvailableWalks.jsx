import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import "../styles/walks.css";
import { useNavigate } from "react-router-dom";

const AvailableWalks = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    city: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

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
    if (!selectedDog) return;

    try {
      const response = await api.createReservationFromWalk(
        selectedWalk.idSetnje,
        { idPsa: Number(selectedDog) }
      );

      if (response.success) {
        setShowReservationModal(false);
        setSelectedDog("");
        loadWalks();
      }
    } catch (err) {
      alert("Greška u rezervaciji");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("hr-HR");

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const [h, m] = duration.split(":");
    return Number(h) > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  const formatPrice = (price) =>
    price !== undefined ? `${Number(price).toFixed(2)} €` : "N/A";

  const cities = Array.from(
    new Set(walks.map((w) => w.city).filter(Boolean))
  ).sort();

  const filteredWalks = walks.filter((w) => {
    const okCity = !filters.city || w.city === filters.city;
    const okType =
      !filters.type || Number(w.tipSetnje) === Number(filters.type);

    const price = Number(w.cijenaSetnje);
    const min = filters.minPrice !== "" ? Number(filters.minPrice) : null;
    const max = filters.maxPrice !== "" ? Number(filters.maxPrice) : null;

    const okMin = min === null || price >= min;
    const okMax = max === null || price <= max;

    return okCity && okType && okMin && okMax;
  });

  if (loading) {
    return (
      <div className="availableWalks">
        <div className="availableWalks__loading">Učitavanje…</div>
      </div>
    );
  }

  return (
    <div className="availableWalks">
      <aside className="availableWalks__filters">
        <button
          className="availableWalks__back"
          onClick={() => navigate("/")}
        >
          ←
        </button>

        <h3>Filters</h3>

        <label>Grad</label>
        <select
          value={filters.city}
          onChange={(e) =>
            setFilters({ ...filters, city: e.target.value })
          }
        >
          <option value="">Svi</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label>Tip šetnje</label>
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
        >
          <option value="">Svi</option>
          <option value="1">Individualna</option>
          <option value="2">Grupna</option>
        </select>

        <label>Min cijena (€)</label>
        <input className="filter-input"
          type="number"
          value={filters.minPrice}
          onChange={(e) =>
            setFilters({ ...filters, minPrice: e.target.value })
          }
        />

        <label>Max cijena (€)</label>
        <input className="filter-input"
          type="number"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters({ ...filters, maxPrice: e.target.value })
          }
        />
      </aside>

      <section className="availableWalks__list">
        <h1 className="availableWalks__title">Dostupne šetnje</h1>

        {error && <div className="availableWalks__error">{error}</div>}

        {filteredWalks.length === 0 ? (
          <div className="availableWalks__empty">
            Nema šetnji koje odgovaraju filterima.
          </div>
        ) : (
          filteredWalks.map((w) => (
            <div key={w.idSetnje} className="availableWalks__card">
              <div className="availableWalks__left">
                <div className="availableWalks__calendar" />
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
                  {w.city && (
                    <div className="availableWalks__info">
                      Grad: {w.city}
                    </div>
                  )}
                  {w.cijenaSetnje && (
                    <div className="availableWalks__info">
                      Cijena: {formatPrice(w.cijenaSetnje)}
                    </div>
                  )}
                </div>
              </div>

              <div className="availableWalks__actions">
                <span className="availableWalks__badge">
                  {Number(w.tipSetnje) === 1
                    ? "Individualna"
                    : "Grupna"}
                </span>

                <button
                  className="availableWalks__book"
                  onClick={() => handleBook(w)}
                >
                  Rezerviraj
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default AvailableWalks;
