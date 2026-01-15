import React from "react";
import "../../styles/termini.css";

const MojiTermini = () => {
  // Kasnije iz API-ja
  const rezervacije = [
    {
      id: 1,
      date: "17.01.2026",
      time: "16:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Planiran",
    },
    {
      id: 2,
      date: "20.01.2026",
      time: "09:45",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Planiran",
    },
    {
      id: 3,
      date: "28.01.2026",
      time: "13:30",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Završen",
    },
    {
      id: 4,
      date: "03.02.2026",
      time: "18:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Otkazan",
    },
    {
      id: 5,
      date: "03.02.2026",
      time: "18:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Otkazan",
    },
    {
      id: 6,
      date: "03.02.2026",
      time: "18:00",
      dog: "Rex",
      duration: "60 min",
      location: "Trešnjevka",
      status: "Otkazan",
    },
  ];

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes("zavr")) return "zavrsen";
    if (s.includes("otkaz")) return "otkazan";
    if (s.includes("plan")) return "planiran";
    if (s.includes("aktiv")) return "aktivan";
    return "";
  };

  return (
    <div className="app">
      <main className="content">
        <h1 className="page-title">Moji termini</h1>

        <div className="Walk-Appointments">
          {rezervacije.map((r) => (
            <div key={r.id} className="Walk-Appointment-card">
              <div className="Walk-Appointment-left">
                <div className="Walk-calendar">
                  <img src="/calendar.png" alt="calendar" />
                </div>

                <div className="Walk-Appointment-text">
                  <div className="Walk-Appointment-date">
                    {r.date} · {r.time}
                  </div>
                  <div className="Walk-Appointment-info">
                    Pas: {r.dog} · {r.duration}
                  </div>
                  <div className="Walk-Appointment-info">
                    Lokacija: {r.location}
                  </div>
                </div>
              </div>

              <div className="iconsWalk">
                <div className={`Walk-status-Appointment ${getStatusClass(r.status)}`}>{r.status}</div>

                <button className="editAppointment-btn">
                  <img src="/edit.png" alt="edit" />
                  Uredi
                </button>

                <button className="deleteAppointment-btn">
                  <img src="/bin.png" alt="trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MojiTermini;
