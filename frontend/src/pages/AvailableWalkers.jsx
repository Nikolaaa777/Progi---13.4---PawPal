import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/walkers.css";

export default function AvailableWalkers() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    city: "",
    rating: "",
  });

  const [walkers, setWalkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // DOHVAT ŠETAČA IZ BACKENDA
  useEffect(() => {
    setLoading(true);

    fetch("/api/walkers/")
      .then((res) => res.json())
      .then((data) => {
        setWalkers(data);
        console.log("walkers from API:", data);
        setLoading(false);
      })
      .catch(() => {
        setWalkers([]);
        setLoading(false);
      });
  }, []);

  // FILTERI (frontend)
  const norm = (s) => (s || "").trim().toLowerCase();

  const filteredWalkers = walkers.filter(
    (w) =>
      (!filters.city || norm(w.city) === norm(filters.city)) &&
      (!filters.rating || (w.rating ?? 0) >= Number(filters.rating)),
  );

  const cities = Array.from(
    new Set(
      walkers
        .map((w) => (w.city || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));


  return (
    <div className="availableWalkers">
      {/* FILTERS */}
      <aside className="availableWalkers__filters">
        {/* BACK */}
        <button
          className="availableWalkers__back"
          onClick={() => navigate("/")}
          aria-label="Natrag"
        >
          ←
        </button>

        <h3>Filter šetača</h3>

        <label>Lokacija</label>
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="">Sve</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}

        </select>

        <label>Minimalna ocjena</label>
        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        >
          <option value="">Sve</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
          <option value="5">5.0</option>
        </select>
      </aside>

      {/* LIST */}
      <section className="availableWalkers__list">
        <h1 className="availableWalkers__title">Dostupni šetači</h1>

        {loading && <p>Učitavanje šetača...</p>}

        {!loading &&
          filteredWalkers.map((w) => (
            <div key={w.id} className="availableWalkers__card">
              <div className="availableWalkers__left">
                <div className="availableWalkers__avatar" />

                <div>
                  <div className="availableWalkers__name">{w.name}</div>
                  <div className="availableWalkers__info">
                    Lokacija: {w.city}
                  </div>
                  <div className="availableWalkers__info">
                    Cijena: {w.price} €
                  </div>
                </div>
              </div>

              <div className="availableWalkers__actions">
                <span className="availableWalkers__rating">
                  ⭐ {w.rating ?? "—"}
                </span>

                <NavLink to={`/setac/${w.id}`} className="availableWalkers__btn">
                  Profil
                </NavLink>
              </div>
            </div>
          ))}

        {!loading && filteredWalkers.length === 0 && (
          <p className="availableWalkers__empty">
            Nema šetača po odabranim kriterijima.
          </p>
        )}
      </section>
    </div>
  );
}
