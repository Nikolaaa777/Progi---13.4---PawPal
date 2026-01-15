import "../../styles/all.css";

export default function MojeRezervacije() {
	//Kasnije uzet iz API-a
	const rezervacije = [
		{
			id: 1,
			date: "17.01.2026",
			time: "16:00",
			dog: "Rex",
			duration: "60 min",
			location: "Trešnjevka",
			status: "nadolazeca",
			canRate: false,
		},
		{
			id: 2,
			date: "20.01.2026",
			time: "09:45",
			dog: "Rex",
			duration: "60 min",
			location: "Trešnjevka",
			status: "nadolazeca",
			canRate: false,
		},
		{
			id: 3,
			date: "28.1.2026",
			time: "13:30",
			dog: "Rex",
			duration: "60 min",
			location: "Trešnjevka",
			status: "nadolazeca",
			canRate: true,
		},
		{
			id: 4,
			date: "3.2.2026",
			time: "18:00",
			dog: "Rex",
			duration: "60 min",
			location: "Trešnjevka",
			status: "otkazana",
			canRate: true,
		},
		{
			id: 5,
			date: "10.1.2026",
			time: "17:15",
			dog: "Rex",
			duration: "60 min",
			location: "Trešnjevka",
			status: "zavrsena",
			canRate: true,
		},
	];

	const label = (status) => {
		if (status === "nadolazeca") return "Nadolazeća";
		if (status === "zavrsena") return "Završena";
		if (status === "otkazana") return "Otkazana";
		return status;
	};

	return (
		<main className="content reservations-page">
			<div className="reservations-header">
				<div className="reservations-title">
					<h1 className="page-title">Moje rezervacije</h1>
				</div>
			</div>

			<div className="reservations-list">
				{rezervacije.map((r) => (
					<div key={r.id} className="reservation-card">
						<div className="reservation-left">
							<div className="reservation-icon">
								<img src="/calendar.png" alt="calendar" />
							</div>

							<div className="reservation-info">
								<div className="reservation-datetime">
									{r.date} • {r.time}
								</div>
								<div className="reservation-meta">
									Pas: {r.dog} • {r.duration}
								</div>
								<div className="reservation-meta">Lokacija: {r.location}</div>
							</div>
						</div>

						<div className="reservation-right">
							<span className={`status-badge ${r.status}`}>
								{label(r.status)}
							</span>

							<div className="reservation-actions">
								<button className="edit-pill">
									<img src="/edit.png" alt="edit" />
									Uredi
								</button>

								<button className="trash-pill">
									<img src="/bin.png" alt="trash" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	);
}
