import "../../styles/editDog.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../../api/client";

export default function UrediPsa() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    health: "",
    energy: "",
    social: "",
    treats: "",
  });

  const onChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const created = await api.createDog({
        imePsa: form.name,
        pasminaPsa: form.breed,
        starostPsa: Number(form.age) || 0,
        zdravPas: form.health,
        energijaPsa: form.energy,
        socPsa: form.social,
        posPsa: form.treats,
      });

      console.log("DOG CREATED:", created);
      nav("/profile/ljubimci");
    } catch (err) {
      console.error("CREATE DOG FAILED:", err);

      // 1) ako je Response
      if (err && typeof err.status === "number") {
        const text = await err.text();
        console.log("STATUS:", err.status);
        console.log("BODY:", text);
        alert(`Status ${err.status}: vidi Console`);
        return;
      }

      // 2) ako je pravi JS error (TypeError: Failed to fetch)
      alert(String(err));
    }
  };

  return (
    <main className="content edit-dog-content">
      <div className="edit-dog-modal">
        <button
          className="edit-dog-back"
          onClick={() => nav("/profile/ljubimci")}
        >
          ←
        </button>

        <h2 className="edit-dog-title">Uredi psa</h2>

        <form onSubmit={onSubmit}>
          <div className="edit-dog-top">
            <button type="button" className="edit-dog-photo">
              <span className="edit-dog-photo-ico">📷</span>
            </button>

            <div className="edit-dog-top-fields">
              <label className="edit-dog-label">
                Ime psa
                <input
                  className="edit-dog-input"
                  placeholder="Unesite ime psa"
                  value={form.name}
                  onChange={onChange("name")}
                />
              </label>

              <label className="edit-dog-label">
                Pasmina
                <input
                  className="edit-dog-input"
                  placeholder="Unesite pasminu"
                  value={form.breed}
                  onChange={onChange("breed")}
                />
              </label>
            </div>
          </div>

          <div className="edit-dog-rows">
            <div className="edit-dog-row">
              <div className="edit-dog-row-ico">🐾</div>
              <div className="edit-dog-row-body">
                <div className="edit-dog-row-title">Starost</div>
                <input
                  className="edit-dog-row-input"
                  placeholder="Unesite starost"
                  value={form.age}
                  onChange={onChange("age")}
                />
              </div>
            </div>

            <div className="edit-dog-row">
              <div className="edit-dog-row-ico">💊</div>
              <div className="edit-dog-row-body">
                <div className="edit-dog-row-title">Zdravstvene napomene</div>
                <input
                  className="edit-dog-row-input"
                  placeholder="Lijekovi, alergije, itd."
                  value={form.health}
                  onChange={onChange("health")}
                />
              </div>
            </div>

            <div className="edit-dog-row">
              <div className="edit-dog-row-ico">🦴</div>
              <div className="edit-dog-row-body">
                <div className="edit-dog-row-title">Dopuštene poslastice</div>
                <input
                  className="edit-dog-row-input"
                  placeholder="Mrkva, jabuke, keksi..."
                  value={form.treats}
                  onChange={onChange("treats")}
                />
              </div>
            </div>

            <div className="edit-dog-row">
              <div className="edit-dog-row-ico">⚡</div>
              <div className="edit-dog-row-body">
                <div className="edit-dog-row-title">
                  Razina energije: {" "}
                  <span className="edit-dog-range-value">{form.energy}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  className="edit-dog-range"
                  value={form.energy}
                  onChange={onChange("energy")}
                />
              </div>
            </div>

            <div className="edit-dog-row">
              <div className="edit-dog-row-ico">🐶</div>
              <div className="edit-dog-row-body">
                <div className="edit-dog-row-title">
                  Razina socijalizacije: {" "}
                  <span className="edit-dog-range-value">{form.social}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  className="edit-dog-range"
                  value={form.social}
                  onChange={onChange("social")}
                />
              </div>
            </div>
          </div>

          <div className="edit-dog-actions">
            <button
              type="button"
              className="edit-dog-cancel"
              onClick={() => nav("/profile/ljubimci")}
            >
              Zatvori
            </button>

            <button type="submit" className="edit-dog-save">
              Spremi promjene
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}