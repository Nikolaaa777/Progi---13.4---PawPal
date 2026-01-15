import React from "react";
import "../../styles/zahtjevi.css";

const ZahtjeviZaSetnju = () => {
  const zahtjevi = [
    {
      id: 1,
      date: "18.01.2026",
      time: "10:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      owner: "Ana K.",
      status: "Na čekanju",
    },
    {
      id: 2,
      date: "19.01.2026",
      time: "14:30",
      dog: "Luna",
      duration: "45 min",
      location: "Maksimir",
      owner: "Marko P.",
      status: "Na čekanju",
    },
    {
      id: 3,
      date: "19.01.2026",
      time: "14:30",
      dog: "Luna",
      duration: "45 min",
      location: "Maksimir",
      owner: "Marko P.",
      status: "Na čekanju",
    },
    {
      id: 4,
      date: "19.01.2026",
      time: "14:30",
      dog: "Luna",
      duration: "45 min",
      location: "Maksimir",
      owner: "Marko P.",
      status: "Na čekanju",
    },
    {
      id: 5,
      date: "19.01.2026",
      time: "14:30",
      dog: "Luna",
      duration: "45 min",
      location: "Maksimir",
      owner: "Marko P.",
      status: "Na čekanju",
    },
    {
      id: 6,
      date: "19.01.2026",
      time: "14:30",
      dog: "Luna",
      duration: "45 min",
      location: "Maksimir",
      owner: "Marko P.",
      status: "Na čekanju",
    },
  ];

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Zahtjevi za šetnju</h1>

        <div className="Walk-Requests">
          <div className="Walk-Requests__inner">
          {zahtjevi.map((z) => (
            <div key={z.id} className="Walk-Request-card">
              <div className="Walk-Request-left">
                <div className="Walk-calendar">
                  <img src="/calendar.png" alt="calendar" />
                </div>

                <div className="Walk-Request-text">
                  <div className="Walk-Request-date">
                    {z.date} · {z.time}
                  </div>
                  <div className="Walk-Request-info">
                    Pas: {z.dog} · {z.duration}
                  </div>
                  <div className="Walk-Request-info">
                    Lokacija: {z.location}
                  </div>
                  <div className="Walk-Request-info">
                    Vlasnik: {z.owner}
                  </div>
                </div>
              </div>

              <div className="Request-buttons">
                <button className="accept-btn">Prihvati</button>
                <button className="reject-btn">Odbij</button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>
    </div>
  );
};
export default ZahtjeviZaSetnju;
