import { useState } from "react";

export default function Register() {
	const [role, setRole] = useState("owner"); // owner | walker

	return (
		<div className="page">
			<div className="card">
				<img src="/logo.png" alt="logo" className="logo" />
				<input type="text" placeholder="Full Name" />
				<input type="email" placeholder="Email" />
				<input type="text" placeholder="Username" />
				<input type="password" placeholder="Password" />

				<div className="role-group">
					<button
						type="button"
						className={`role-btn ${role === "owner" ? "active" : ""}`}
						onClick={() => setRole("owner")}
					>
						Vlasnik
					</button>
					<button
						type="button"
						className={`role-btn ${role === "walker" ? "active" : ""}`}
						onClick={() => setRole("walker")}
					>
						Šetač
					</button>
				</div>

				<button>Sign up</button>

				<p className="legal">
					By signing up, you agree to our <a href="#">Terms</a>,{" "}
					<a href="#">Data Policy</a> and <a href="#">Cookies Policy</a>.
				</p>
			</div>
		</div>
	);
}
