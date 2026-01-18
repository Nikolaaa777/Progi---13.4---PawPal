import React, { useState } from "react";
import "../styles/walks.css";

const AvailableWalks = () => {
  const [filters, setFilters] = useState({ city: "", type: "" });

  const walks = [
    {
      id: 1,
      date: "17.01.2026",
      time: "16:00",
      duration: "60 min",
      location: "Trešnjevka",
      type: "Individual",
    },
    {
      id: 2,
      date: "20.01.2026",
      time: "09:45",
      duration: "45 min",
      location: "Maksimir",
      type: "Group",
    },
  ];

  const filteredWalks = walks.filter(
    (w) =>
      (!filters.city || w.location === filters.city) &&
      (!filters.type || w.type === filters.type)
  );

  return (
    <div className="availableWalks">
      <aside className="availableWalks__filters">
        <h3>Filters</h3>

        <label>City</label>
        <select onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
          <option value="">All</option>
          <option value="Trešnjevka">Trešnjevka</option>
          <option value="Maksimir">Maksimir</option>
        </select>

        <label>Walk type</label>
        <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All</option>
          <option value="Individual">Individual</option>
          <option value="Group">Group</option>
        </select>
      </aside>

      <section className="availableWalks__list">
        <h1 className="availableWalks__title">Available walks</h1>

        {filteredWalks.map((w) => (
          <div key={w.id} className="availableWalks__card">
            <div className="availableWalks__left">
              <div className="availableWalks__calendar" />

              <div>
                <div className="availableWalks__date">
                  {w.date} · {w.time}
                </div>
                <div className="availableWalks__info">Duration: {w.duration}</div>
                <div className="availableWalks__info">Location: {w.location}</div>
              </div>
            </div>

            <div className="availableWalks__actions">
              <span className="availableWalks__badge">{w.type}</span>
              <button className="availableWalks__book">Book</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AvailableWalks;
