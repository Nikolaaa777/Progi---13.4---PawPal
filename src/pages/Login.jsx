import { Link } from "react-router-dom";

export default function Login() {
	function handleLogin(e) {
		e.preventDefault();
		alert("Log in clicked!");
	}

	function handleGoogleLogin() {
		alert("Google Sign-In clicked!");
	}

	return (
		<div className="page">
			<div className="card">
				<img src="/logo.png" alt="logo" className="logo" />

				<input type="email" placeholder="Email" />
				<input type="password" placeholder="Password" />

				<button onClick={handleLogin}>Log in</button>

				<button type="button" className="google" onClick={handleGoogleLogin}>
					<img
						src="https://developers.google.com/identity/images/g-logo.png"
						alt="Google logo"
						width="20"
						height="20"
					/>
					Sign in with Google
				</button>

				<div className="links-bottom">
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
