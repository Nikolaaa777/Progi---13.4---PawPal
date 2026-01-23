import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/termini.css";

const WALK_TYPE_LABELS = {
  1: "Individualna",
  2: "Grupna",
};

const MojiTermini = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [walksRes, reservationsRes] = await Promise.all([
        api.walks(),
        api.getMyReservations(),
      ]);

      const walks = (walksRes.data || []).map((w) => ({
        id: w.idSetnje,
        type: "walk",
        date: w.terminSetnje,
        duration: w.trajanjeSetnje,
        price: w.cijenaSetnje,
        walkType: w.tipSetnje,
        town: w.city,
        status: "Planiran",
      }));

      const reservations = (reservationsRes.data || [])
        .filter((r) => r.potvrdeno && r.walk_details?.terminSetnje)
        .map((r) => ({
          id: r.idRezervacije,
          type: "reservation",
          date: r.walk_details.terminSetnje,
          dog: r.dog_name,
          duration: r.walk_details.trajanjeSetnje,
          walkType: r.walk_details.tipSetnje,
          town: r.walk_details.city,
          status: r.odradena ? "Završen" : "Rezerviran",
          done: r.odradena,
        }));


      const merged = [...walks, ...reservations].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setItems(merged);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
  navigate(`/profile/termini/${id}/uredi`);
};

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati termin?")) return;
    await api.deleteWalk(id);
    loadData();
  };

  const handleChat = (id) => {
    navigate(`/chat?reservationId=${id}`);
  };

  const handleFinish = async (id) => {
    if (!window.confirm("Označiti šetnju kao završenu?")) return;
    await api.markWalkDone(id);
    loadData();
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes("zavr")) return "zavrsen";
    if (s.includes("rezerv")) return "aktivan";
    return "planiran";
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="app">
      <main className="Walk-Appointments-content">
        <h1 className="Walk-Appointments-title">Moji termini</h1>

        <div className="Walk-Appointments">
          <div className="Walk-Appointments__inner">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="Walk-Appointment-card"
              >
                <div className="Walk-Appointment-left">
                  <div className="Walk-calendar">
                    <img src="/calendar.png" alt="calendar" />
                  </div>

                  <div className="Walk-Appointment-text">
                    <div className="Walk-Appointment-date">
                      {formatDate(item.date)} · {formatTime(item.date)}
                    </div>

                    <div className="Walk-Appointment-info">
                      {WALK_TYPE_LABELS[item.walkType] ?? "—"} · {item.town}
                    </div>

                    {item.type === "reservation" && (
                      <div className="Walk-Appointment-info">
                        Pas: {item.dog} · {item.duration}
                      </div>
                    )}

                    {item.type === "walk" && (
                      <div className="Walk-Appointment-info">
                        Trajanje: {item.duration} · {item.price} €
                      </div>
                    )}
                  </div>
                </div>

                <div className="iconsWalk">
                  <div
                    className={`Walk-status-Appointment ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </div>

                  {item.type === "walk" && (
                    <>
                      <button
                        className="editAppointment-btn"
                        onClick={() => handleEdit(item.id)}
                      >
                        <img src="/edit.png" alt="edit" />
                        Uredi
                      </button>

                      <button
                        className="deleteAppointment-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        <img src="/bin.png" alt="trash" />
                      </button>
                    </>
                  )}

                  {item.type === "reservation" && (
                    <>
                      {!item.done && (
                        <button
                          className="editAppointment-btn"
                          onClick={() => handleFinish(item.id)}
                        >
                          Završi
                        </button>
                      )}

                      <button
                        className="editAppointment-btn"
                        onClick={() => handleChat(item.id)}
                      >
                        💬 Chat
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            <NavLink to="/profile/termini/dodaj" className="addAppointment-btn">
              Dodaj termin <img src="/plus.png" alt="plus" />
            </NavLink>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MojiTermini;
