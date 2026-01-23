import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/walkers.css";
import { api } from "../api/client";

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
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await api.availableWalkers();

        if (cancelled) return;

        // očekujemo array
        setWalkers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (cancelled) return;
        setWalkers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const norm = (s) => (s || "").trim().toLowerCase();

  const filteredWalkers = useMemo(() => {
    const minRating = filters.rating ? Number(filters.rating) : null;

    return walkers.filter((w) => {
      const cityOk = !filters.city || norm(w.city) === norm(filters.city);

      const r = w.rating == null ? null : Number(w.rating);
      const ratingOk = !minRating || ((r ?? 0) >= minRating);

      return cityOk && ratingOk;
    });
  }, [walkers, filters.city, filters.rating]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(walkers.map((w) => (w.city || "").trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [walkers]);

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
          filteredWalkers.map((w) => {
            const id = w.id ?? w.idSetac; // fallback ako nekad dođe drugi naziv

            return (
              <div key={id} className="availableWalkers__card">
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

                  <NavLink to={`/setac/${id}`} className="availableWalkers__btn">
                    Profil
                  </NavLink>
                </div>
              </div>
            );
          })}

        {!loading && filteredWalkers.length === 0 && (
          <p className="availableWalkers__empty">
            Nema šetača po odabranim kriterijima.
          </p>
        )}
      </section>
    </div>
  );
}
