export default function Register() {
	return (
		<div className="page">
			<div className="card">
				<img src="/logo.png" alt="logo" className="logo" />
				<input type="text" placeholder="Full Name" />
				<input type="email" placeholder="Email" />
				<input type="text" placeholder="Username" />
				<input type="password" placeholder="Password" />

				<div className="roles">
					<label className="pill">
						<input type="radio" name="role" defaultChecked /> Vlasnik
					</label>
					<label className="pill">
						<input type="radio" name="role" /> Šetač
					</label>
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
