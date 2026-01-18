import { useState } from "react";
import "../styles/walkers.css";

export default function AvailableWalkers() {
  const [filters, setFilters] = useState({ city: "", rating: "" });

  const walkers = [
    {
      id: 1,
      name: "Ana Kovač",
      city: "Zagreb",
      rating: 4.9,
      walks: 120,
    },
    {
      id: 2,
      name: "Marko Horvat",
      city: "Split",
      rating: 4.7,
      walks: 86,
    },
    {
      id: 3,
      name: "Ivana Marić",
      city: "Zagreb",
      rating: 5.0,
      walks: 200,
    },
  ];

  const filteredWalkers = walkers.filter(
    (w) =>
      (!filters.city || w.city === filters.city) &&
      (!filters.rating || w.rating >= Number(filters.rating))
  );

  return (
    <div className="availableWalkers">
      <aside className="availableWalkers__filters">
        <h3>Filter šetača</h3>

        <label>Grad</label>
        <select onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
          <option value="">Svi</option>
          <option value="Zagreb">Zagreb</option>
          <option value="Split">Split</option>
        </select>

        <label>Minimalna ocjena</label>
        <select onChange={(e) => setFilters({ ...filters, rating: e.target.value })}>
          <option value="">Sve</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
          <option value="5">5.0</option>
        </select>
      </aside>

      <section className="availableWalkers__list">
        <h1 className="availableWalkers__title">Dostupni šetači</h1>

        {filteredWalkers.map((w) => (
          <div key={w.id} className="availableWalkers__card">
            <div className="availableWalkers__left">
              <div className="availableWalkers__avatar" />

              <div>
                <div className="availableWalkers__name">{w.name}</div>
                <div className="availableWalkers__info">Grad: {w.city}</div>
                <div className="availableWalkers__info">
                  Šetnje: {w.walks}
                </div>
              </div>
            </div>

            <div className="availableWalkers__actions">
              <span className="availableWalkers__rating">⭐ {w.rating}</span>
              <button className="availableWalkers__btn">Profil</button>
            </div>
          </div>
        ))}

        {filteredWalkers.length === 0 && (
          <p className="availableWalkers__empty">Nema šetača po kriterijima.</p>
        )}
      </section>
    </div>
  );
}
