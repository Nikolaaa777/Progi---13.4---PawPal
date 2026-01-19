import React from "react";
import "../../styles/rezervacije.css";

const MojeRezervacije = () => {
  // Kasnije iz API-ja
  const rezervacije = [
    {
      id: 1,
      date: "17.01.2026",
      time: "16:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Planirana",
    },
    {
      id: 2,
      date: "20.01.2026",
      time: "09:45",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Planirana",
    },
    {
      id: 3,
      date: "28.01.2026",
      time: "13:30",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Završena",
    },
    {
      id: 4,
      date: "03.02.2026",
      time: "18:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Otkazana",
    },
    {
      id: 5,
      date: "04.02.2026",
      time: "18:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Aktivna",
    },
    {
      id: 6,
      date: "05.02.2026",
      time: "18:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Otkazana",
    },
  ];

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();

    if (s.includes("zavr")) return "zavrsena";
    if (s.includes("otkaz")) return "otkazana";
    if (s.includes("plan")) return "planirana";
    if (s.includes("aktiv")) return "aktivna";

    return "";
  };

  const statusOrder = {
    zavrsena: 1,
    planirana: 2,
    aktivna: 3,
    otkazana: 4,
  };

  const sortedRezervacije = [...rezervacije].sort((a, b) => {
    const statusA = getStatusClass(a.status);
    const statusB = getStatusClass(b.status);

    return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
  });

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Moje rezervacije</h1>

        <div className="Walk-Reservations">
          <div className="Walk-Reservations__inner">
            {sortedRezervacije.map((r) => (
              <div key={r.id} className="Walk-Reservation-card">
                <div className="Walk-Reservation-left">
                  <div className="Walk-calendar">
                    <img src="/calendar.png" alt="calendar" />
                  </div>

                  <div className="Walk-Reservation-text">
                    <div className="Walk-Reservation-date">
                      {r.date} · {r.time}
                    </div>

                    <div className="Walk-Reservation-info">
                      Pas: {r.dog} · {r.duration}
                    </div>

                    <div className="Walk-Reservation-info">
                      Lokacija: {r.location}
                    </div>
                  </div>
                </div>

                <div className="iconsWalk">
                  <div
                    className={`Walk-status-reservation ${getStatusClass(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </div>

                  {getStatusClass(r.status) === "zavrsena" && (
                    <button className="payReservation-btn">Plaćanje</button>
                  )}

                  <button className="deleteReservation-btn">
                    <img src="/bin.png" alt="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MojeRezervacije;
