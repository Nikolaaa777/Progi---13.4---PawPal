import { useNavigate } from "react-router-dom";
import "../../styles/urediPsa.css";

export default function DogProfileEdit() {
  const navigate = useNavigate(); 

  return (
    <div className="edit-page">
      <div className="card">
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

          <label>Razina energije</label>
          <input defaultValue="Energičan" />

          <label>Dopuštene poslastice</label>
          <input defaultValue="Mrkva, jabuke, goveđi keksi" />
        </div>

        <div className="buttons">
          <button className="cancel" onClick={() => navigate(-1)}>
            Otkaži
          </button>
          <button className="save">Spremi promjene</button>
        </div>
      </div>
    </div>
  );
}
