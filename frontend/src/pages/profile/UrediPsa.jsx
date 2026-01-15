import { useNavigate } from "react-router-dom";
import "../../styles/urediPsa.css";

export default function DogProfileEdit() {
  const navigate = useNavigate();

  return (
    <div className="edit-page">
      <div className="cardDog">
        <div className="header">
          <span className="back" onClick={() => navigate(-1)}>
            ←
          </span>
          <h2>Uređivanje profila psa</h2>
        </div>

        <div className="profile">
          <img
            src="https://images.unsplash.com/photo-1552053831-71594a27632d"
            alt="Rex"
          />
          <div>
            <h3>Rex</h3>
            <p>Labrador Retriever</p>
          </div>
        </div>

        <div className="form">
          <label>Ime psa</label>
          <input defaultValue="Rex" />

          <label>Pasmina</label>
          <input defaultValue="Labrador Retriever" />

          <label>Zdravstvene napomene</label>
          <input defaultValue="Alergičan na piletinu, Potreban lijek: Rimadyl" />

          <label>Dopuštene poslastice</label>
          <input defaultValue="Mrkva, jabuke, goveđi keksi" />

          <label htmlFor="energy">Razina energije</label>
          <input type="range" id="energy" min={0} max={4} step={1} defaultValue={2}/>

          <label htmlFor="social">Razina socijalizacije</label>
          <input type="range" id="social" min={0} max={4} step={1} defaultValue={2}/>
        </div>

        <div className="buttons">
          <button className="cancel" onClick={() => navigate(-1)}>
            Otkaži
          </button>
          <button className="save">Spremi</button>
        </div>
      </div>
    </div>
  );
}
