import "../../styles/all.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function ProfileInfo() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [petsCount, setPetsCount] = useState(0);
  const [notifOn, setNotifOn] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((u) => {
        setUser(u);
        // ako backend vraća nešto tipa notifications_enabled, koristi:
        if (typeof u?.notifications_enabled === "boolean")
          setNotifOn(u.notifications_enabled);
      })
      .catch(console.error);

    api
      .dogs()
      .then((dogs) => setPetsCount(Array.isArray(dogs) ? dogs.length : 0))
      .catch(console.error);
  }, []);

  const fullName =
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Korisnik";

  const role = user?.is_walker ? "Šetač" : "Vlasnik";

  return (
    <main className="contentInfo">
      <section className="profile">
        <div className="avatar">
          {user?.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt="profile"
              className="avatar-img"
            />
          ) : (
            <div className="avatar-placeholder">
              {user?.username?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
      </section>

      <section className="info-card">
        <h2 className="info-name">{fullName}</h2>

        <div className="info-row">
          <span className="info-icon">✉️</span>
          <span>{user?.email || "-"}</span>
        </div>

        <div className="info-row">
          <span className="info-icon">👤</span>
          <span>Tip: {role}</span>
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-toprow">
            <img src="/paw.png" alt="ljubimci" className="stat-icon" />
            <div className="stat-value">{petsCount}</div>
          </div>
          <div className="stat-label">Ljubimca</div>
        </div>

        {/* Ostale statove ostavi za kasnije kad backend to podrži */}
        <div className="stat-card">
          <div className="stat-toprow">
            <img src="/walk.png" alt="šetnje" className="stat-icon" />
            <div className="stat-value">-</div>
          </div>
          <div className="stat-label">Ukupno šetnji</div>
        </div>

        <div className="stat-card">
          <div className="stat-toprow">
            <img src="/star.png" alt="ocjena" className="stat-icon" />
            <div className="stat-value">-</div>
          </div>
          <div className="stat-label">Ocjena</div>
        </div>
      </section>

      <section className="actions-row">
        <button className="action-btn primary">Neki gumb</button>

        <button
          className="action-btn"
          onClick={() => navigate("/profile/uredi")}
        >
          Uredi profil
        </button>

        <label className="notif-toggle">
          <span>Obavijesti</span>
          <input
            type="checkbox"
            checked={notifOn}
            onChange={async () => {
              setNotifOn((v) => !v);
              try {
                await api.toggleNotifications();
              } catch (e) {
                console.error(e);
                setNotifOn((v) => !v); // rollback ako pukne
              }
            }}
          />
          <span className="toggle-ui" />
        </label>
      </section>
    </main>
  );
}
