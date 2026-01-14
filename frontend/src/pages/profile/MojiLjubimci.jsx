import "../../styles/all.css";

export default function MojiLjubimci() {
	return (
		<main className="content">
			<h1 className="page-title">Moji ljubimci</h1>

			<div className="appointments">
				<div className="appointment-card">
					<span>Detalji psa</span>
					<div className="icons">
						<button className="icon-btn">
							<img src="/edit.png" alt="edit" />
						</button>
						<button className="icon-btn">
							<img src="/bin.png" alt="trash" />
						</button>
					</div>
				</div>

				<div className="appointment-card">
					<span>Detalji psa</span>
					<div className="icons">
						<button className="icon-btn">
							<img src="/edit.png" alt="edit" />
						</button>
						<button className="icon-btn">
							<img src="/bin.png" alt="trash" />
						</button>
					</div>
				</div>

				<div className="appointment-card">
					<span>Detalji psa</span>
					<div className="icons">
						<button className="icon-btn">
							<img src="/edit.png" alt="edit" />
						</button>
						<button className="icon-btn">
							<img src="/bin.png" alt="trash" />
						</button>
					</div>
				</div>
			</div>

			<button className="add-btn">
				Dodaj psa
				<span className="icon-btn">
					<img src="/plus.png" alt="add" />
				</span>
			</button>
		</main>
	);
}
