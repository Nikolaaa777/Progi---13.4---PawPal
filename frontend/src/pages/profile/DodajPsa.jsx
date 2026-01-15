import "../../styles/all.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DodajPsa() {
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

	const onSubmit = (e) => {
		e.preventDefault();
		// TODO: kasnije POST na backend
		nav("/profile/ljubimci");
	};

	return (
		<main className="content adddog-content">
			<div className="adddog-modal">
				<button
					className="adddog-back"
					onClick={() => nav("/profile/ljubimci")}
				>
					←
				</button>

				<h2 className="adddog-title">Dodavanje psa</h2>

				<form onSubmit={onSubmit}>
					<div className="adddog-top">
						<button type="button" className="adddog-photo">
							<span className="adddog-photo-ico">📷</span>
						</button>

						<div className="adddog-top-fields">
							<label className="adddog-label">
								Ime psa
								<input
									className="adddog-input"
									placeholder="Unesite ime psa"
									value={form.name}
									onChange={onChange("name")}
								/>
							</label>

							<label className="adddog-label">
								Pasmina
								<input
									className="adddog-input"
									placeholder="Unesite pasminu"
									value={form.breed}
									onChange={onChange("breed")}
								/>
							</label>
						</div>
					</div>

					<div className="adddog-rows">
						<div className="adddog-row">
							<div className="adddog-row-ico">🐾</div>
							<div className="adddog-row-body">
								<div className="adddog-row-title">Starost</div>
								<input
									className="adddog-row-input"
									placeholder="Unesite starost"
									value={form.age}
									onChange={onChange("age")}
								/>
							</div>
						</div>

						<div className="adddog-row">
							<div className="adddog-row-ico">💊</div>
							<div className="adddog-row-body">
								<div className="adddog-row-title">Zdravstvene napomene</div>
								<input
									className="adddog-row-input"
									placeholder="Lijekovi, alergije, itd."
									value={form.health}
									onChange={onChange("health")}
								/>
							</div>
						</div>

						<div className="adddog-row">
							<div className="adddog-row-ico">⚡</div>
							<div className="adddog-row-body">
								<div className="adddog-row-title">Razina energije</div>
								<input
									className="adddog-row-input"
									placeholder="Npr. miran, energičan"
									value={form.energy}
									onChange={onChange("energy")}
								/>
							</div>
						</div>

						<div className="adddog-row">
							<div className="adddog-row-ico">🐶</div>
							<div className="adddog-row-body">
								<div className="adddog-row-title">Socijalizacija</div>
								<input
									className="adddog-row-input"
									placeholder="Npr. voli druge pse"
									value={form.social}
									onChange={onChange("social")}
								/>
							</div>
						</div>

						<div className="adddog-row">
							<div className="adddog-row-ico">🦴</div>
							<div className="adddog-row-body">
								<div className="adddog-row-title">Dopuštene poslastice</div>
								<input
									className="adddog-row-input"
									placeholder="Mrkva, jabuke, keksi..."
									value={form.treats}
									onChange={onChange("treats")}
								/>
							</div>
						</div>
					</div>

					<div className="adddog-actions">
						<button
							type="button"
							className="adddog-cancel"
							onClick={() => nav("/profile/ljubimci")}
						>
							Zatvori
						</button>

						<button type="submit" className="adddog-save">
							Dodaj psa
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}
