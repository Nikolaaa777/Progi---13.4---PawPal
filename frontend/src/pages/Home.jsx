import Navbar from "../components/Navbar";
import "../styles/home.css";

export default function Home({ user, setUser }) {
	return (
		<>
			<Navbar user={user} setUser={setUser} />
			<section className="hero">
				<div className="hero-art">
					<img src="/hero-dog.png" alt="Šetnja psa" className="hero-img" />
					<div className="ground-shadow" aria-hidden="true"></div>
				</div>

				<div className="hero-copy">
					<h1>
						Šetnje za pse,
						<br />
						jednim klikom.
					</h1>
					<p>Brzo pronađite provjerenog šetača i rezervirajte termin.</p>
					<div className="hero-actions">
						<a href="/setnje" className="btn-primary">
							Pogledaj šetnje
						</a>
						<a href="/setaci" className="btn-ghost">
							Naši šetači
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
