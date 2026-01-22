import "../../styles/all.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function UrediProfil() {
	const nav = useNavigate();

	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		city: "",
	});

	useEffect(() => {
		api.me().then((me) => {
			setForm({
				first_name: me.first_name || "",
				last_name: me.last_name || "",
				email: me.email || "",
				phone: me.phone || "",
				city: me.city || "",
			});
		});
	}, []);

	const [saving, setSaving] = useState(false);

	const onSubmit = async () => {
		try {
			setSaving(true);
			await api.updateMe(form);
			nav("/profile");
		} catch (err) {
			console.error(err);
			alert("Save failed (check Console/Network)");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="overlay">
			<div className="edit-card">
				<button type="button" className="back-btn" onClick={() => nav(-1)}>
					←
				</button>

				<form onSubmit={onSubmit}>
					<h1>Uređivanje profila</h1>

					<label className="field">
						<span>Ime</span>
						<input
							placeholder="Ime"
							value={form.first_name}
							onChange={(e) =>
								setForm((f) => ({ ...f, first_name: e.target.value }))
							}
						/>
					</label>

					<label className="field">
						<span>Prezime</span>
						<input
							placeholder="Prezime"
							value={form.last_name}
							onChange={(e) =>
								setForm((f) => ({ ...f, last_name: e.target.value }))
							}
						/>
					</label>

					<label className="field">
						<span>Email adresa</span>
						<input
							placeholder="Email"
							value={form.email}
							onChange={(e) =>
								setForm((f) => ({ ...f, email: e.target.value }))
							}
						/>
					</label>

					<label className="field">
						<span>Broj telefona</span>
						<input
							placeholder="Telefon"
							value={form.phone}
							onChange={(e) =>
								setForm((f) => ({ ...f, phone: e.target.value }))
							}
						/>
					</label>

					<label className="field">
						<span>Grad</span>
						<input
							placeholder="Grad"
							value={form.city}
							onChange={(e) =>
								setForm((f) => ({ ...f, city: e.target.value }))
							}
						/>
					</label>

					<button
						className="primary-btn"
						type="button"
						onClick={onSubmit}
						disabled={saving}
					>
						{saving ? "Spremam..." : "Spremi promjene"}
					</button>
				</form>
			</div>
		</div>
	);
}
