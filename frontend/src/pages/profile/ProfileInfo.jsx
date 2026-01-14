import "../../styles/all.css";

export default function ProfileInfo() {
	return (
		<main className="content">
			<h1>Moje informacije</h1>

			<button className="edit-btn">
				Uredi profil
				<span className="icon-btn">
					<img src="/edit.png" alt="edit" />
				</span>
			</button>
		</main>
	);
}
