import "../../styles/all.css";
import { useNavigate } from "react-router-dom";

export default function UrediProfil() {
	const nav = useNavigate();

	return (
		<div className="overlay">
			<div className="edit-card">
				<button className="back-btn" onClick={() => nav(-1)}>
					←
				</button>

				<h1>Uređivanje profila</h1>

				<label className="field">
					<span>Ime i prezime vlasnika</span>
					<input defaultValue="Ivan Horvat" />
				</label>

				<label className="field">
					<span>Email adresa</span>
					<input defaultValue="ivan.horvat@example.com" />
				</label>

				<label className="field">
					<span>Broj telefona</span>
					<input defaultValue="+385 91 123 4567" />
				</label>

				<button className="primary-btn">Spremi promjene</button>
			</div>
		</div>
	);
}
