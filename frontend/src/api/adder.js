document.addEventListener("DOMContentLoaded", () => {
	const addBtn = document.querySelector(".add-btn");
	const container = document.querySelector(".appointments");

	if (!addBtn || !container) return;

	addBtn.addEventListener("click", () => {
		const card = document.createElement("div");
		card.className = "appointment-card";

		card.innerHTML = `
          <span>Detalji psa</span>
					<div className="icons">
						<button
							className="edit-btn"
							onClick={() => nav("/profile/ljubimci/1/uredi")}
						>
							<img src="/edit.png" alt="edit" />
						</button>

						<button className="delete-btn">
							<img src="/bin.png" alt="trash" />
						</button>
					</div>
    `;

		container.appendChild(card);

		const deleteBtn = card.querySelector(".delete-btn");
		if (deleteBtn) {
			deleteBtn.addEventListener("click", () => {
				card.remove();
			});
		}
	});
});
