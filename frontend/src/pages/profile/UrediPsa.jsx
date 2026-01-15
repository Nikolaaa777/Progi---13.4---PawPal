import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "../../styles/urediPsa.css";

export default function DogProfileEdit() {
	const { idPsa } = useParams();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		imePsa: "",
		pasminaPsa: "",
		zdravPas: "",
		posPsa: "",
		energijaPsa: 2,
		socPsa: 2,
	});

	useEffect(() => {
		api.dog(idPsa).then((data) => {
			setForm({
				imePsa: data.imePsa,
				pasminaPsa: data.pasminaPsa,
				zdravPas: data.zdravPas,
				posPsa: data.posPsa,
				energijaPsa: data.energijaPsa,
				socPsa: data.socPsa,
			});
		});
	}, [idPsa]);

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
						<h3>{form.imePsa || "Pas"}</h3>
						<p>{form.pasminaPsa || ""}</p>
					</div>
				</div>

				<div className="form">
					<label>Ime psa</label>
					<input
						value={form.imePsa}
						onChange={(e) => setForm({ ...form, imePsa: e.target.value })}
					/>

					<label>Pasmina</label>
					<input
						value={form.pasminaPsa}
						onChange={(e) => setForm({ ...form, pasminaPsa: e.target.value })}
					/>

					<label>Zdravstvene napomene</label>
					<input
						value={form.zdravPas}
						onChange={(e) => setForm({ ...form, zdravPas: e.target.value })}
					/>

					<label>Dopuštene poslastice</label>
					<input
						value={form.posPsa}
						onChange={(e) => setForm({ ...form, posPsa: e.target.value })}
					/>

					<label htmlFor="energy">Razina energije</label>
					<input
						type="range"
						min={0}
						max={4}
						value={form.energijaPsa}
						onChange={(e) =>
							setForm({ ...form, energijaPsa: Number(e.target.value) })
						}
					/>

					<label htmlFor="social">Razina socijalizacije</label>
					<input
						type="range"
						min={0}
						max={4}
						value={form.socPsa}
						onChange={(e) =>
							setForm({ ...form, socPsa: Number(e.target.value) })
						}
					/>
				</div>

				<div className="buttons">
					<button className="cancel" onClick={() => navigate(-1)}>
						Otkaži
					</button>
					<button
						className="save"
						onClick={async () => {
							await api.updateDog(idPsa, form);
							navigate("/profile/ljubimci");
						}}
					>
						Spremi
					</button>
				</div>
			</div>
		</div>
	);
}
