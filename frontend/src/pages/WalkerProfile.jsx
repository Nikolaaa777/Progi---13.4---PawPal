import "../styles/walkerProfile.css";
import { useNavigate } from "react-router-dom";

export default function WalkerProfile() {
  const navigate = useNavigate();

  const walker = {
    name: "Ana Kovač",
    city: "Zagreb",
    rating: 4.9,
    walks: 120,
    bio: "Pouzdana i iskusna šetačica pasa s više od 5 godina iskustva. Volim duge šetnje i brigu o svakom psu kao da je moj.",
    reviews: [
      {
        id: 1,
        user: "Ivan P.",
        grade: 5,
        comment: "Odlična šetačica! Pas ju obožava.",
      },
      {
        id: 2,
        user: "Marija K.",
        grade: 4.5,
        comment: "Vrlo pouzdana i uvijek na vrijeme.",
      },
      {
        id: 3,
        user: "Petra L.",
        grade: 5,
        comment: "Preporučujem svima! Profesionalna i ljubazna.",
      },
    ],
  };

  return (
    <div className="walkerProfile">
      <div className="walkerProfile__card">
        <button
          className="walkerProfile__back"
          onClick={() => navigate("/setaci")}
          aria-label="Natrag"
        >
          ←
        </button>

        {/* Header */}
        <div className="walkerProfile__header">
          <div className="walkerProfile__avatar" />

          <div className="walkerProfile__headerInfo">
            <h1>{walker.name}</h1>
            <p className="walkerProfile__city">{walker.city}</p>

            <div className="walkerProfile__stats">
              <span>⭐ {walker.rating}</span>
              <span>🐾 {walker.walks} šetnji</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="walkerProfile__section">
          <h3>O meni</h3>
          <p>{walker.bio}</p>
        </div>

        {/* Reviews */}
        <div className="walkerProfile__section">
          <h3>Recenzije</h3>

          <div className="walkerProfile__reviews">
            {walker.reviews.map((r) => (
              <div key={r.id} className="walkerProfile__review">
                <div className="walkerProfile__reviewHeader">
                  <span className="walkerProfile__reviewUser">{r.user}</span>
                  <span className="walkerProfile__reviewGrade">
                    ⭐ {r.grade}
                  </span>
                </div>

                <p className="walkerProfile__reviewText">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="walkerProfile__actions">
          <button
            className="walkerProfile__secondary"
            onClick={() => navigate("/setaci")}
          >
            Natrag
          </button>

          <button className="walkerProfile__primary" onClick={() => navigate("/setnje")}>Pogledaj šetnje</button>
        </div>
      </div>
    </div>
  );
}
