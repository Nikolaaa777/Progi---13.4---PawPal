import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";



export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState("");
	const nav = useNavigate();

	async function handleLogin(e) {
		e.preventDefault();
		setErr("");
		try {
			await api.login(email, password);
			nav("/");
		} catch {
			setErr("Neispravni podaci za prijavu.");
		}
	}

	async function handleGoogleLogin() {
		try {
			setErr("");

			const res = await api.googleLoginUrl(); // očekujemo { url: "/accounts/..." } ili string
			const path = typeof res === "string" ? res : res.url;

			const base = import.meta.env.VITE_API_BASE_URL;
			if (!base) throw new Error("Missing VITE_API_BASE_URL");
			if (!path) throw new Error("Missing google login path");

			window.location.assign(`${base}${path}`);
		} catch (e) {
			console.error(e);
			setErr("Google prijava trenutno nije dostupna.");
		}
	}

	return (
		<div className="auth-page">
			<div className="card">
				<img src="/logo.png" alt="logo" className="logo" />
				<form onSubmit={handleLogin}>
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
					{err && <p style={{ color: "crimson" }}>{err}</p>}
					<button type="submit">Log in</button>
				</form>
				<button type="button" className="google" onClick={handleGoogleLogin}>
					<img
						src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
						alt="Google"
						className="google-icon"
					/>
					Sign in with Google
				</button>

				<div className="links-bottom auth-links">
					<a href="#">Forgot your password?</a>
					<p>
						Don’t have an account?{" "}
						<Link to="/register">
							<b>Sign up</b>
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
