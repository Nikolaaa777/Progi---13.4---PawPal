import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Register() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("vlasnik");
	const [err, setErr] = useState("");
	const nav = useNavigate();

	async function onSubmit(e) {
		e.preventDefault();
		setErr("");
		try {
			const isWalker = role === "setac";

			await api.register({
				email,
				first_name: firstName,
				last_name: lastName,
				password,
				is_walker: isWalker,
			});

			nav("/login");
		} catch {
			setErr("Registracija nije uspjela.");
		}
	}

	async function handleGoogleLogin() {
		try {
			const url = await api.googleLoginUrl();
			window.location.href = url;
		} catch {
			setErr("Google prijava trenutno nije dostupna.");
		}
	}

	return (
		<div className="auth-page">
			<div className="card">
				<img src="/logo.png" alt="logo" className="logo" />
				<form onSubmit={onSubmit}>
					<input
						type="text"
						placeholder="First Name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						required
					/>
					<input
						type="text"
						placeholder="Last Name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						required
					/>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<div className="role-group">
						<button
							type="button"
							className={`role-btn ${role === "vlasnik" ? "active" : ""}`}
							onClick={() => setRole("vlasnik")}
						>
							Vlasnik
						</button>
						<button
							type="button"
							className={`role-btn ${role === "setac" ? "active" : ""}`}
							onClick={() => setRole("setac")}
						>
							Šetač
						</button>
					</div>

					{err && <p style={{ color: "crimson" }}>{err}</p>}
					<button type="submit">Sign up</button>
					<button type="button" className="google" onClick={handleGoogleLogin}>
						<img
							src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
							alt="Google logo"
							className="google-icon"
						/>
						Sign up with Google
					</button>
				</form>

				<p className="legal">
					By signing up, you agree to our <a href="#">Terms</a>,{" "}
					<a href="#">Data Policy</a> and <a href="#">Cookies Policy</a>.
				</p>
			</div>
		</div>
	);
}
