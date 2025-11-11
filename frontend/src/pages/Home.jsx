import Navbar from "../components/Navbar";
import "../styles/home.css";

export default function Home() {
	return (
		<>
			<Navbar />
			<section className="hero">
				<div className="hero-art" aria-hidden="true" />
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
