import { useState } from "react";
import "../../styles/adminGen.css";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {

	const nav = useNavigate();

	return (
		 <div className="app">
      <aside className="sidebar">
        <div className="back" onClick={() => nav("/")}>
            ←
          </div>

        <div className="profile">
          <img className="avatar" src="/admin.png" alt="admin" />
          <div>
            <strong>ImePrezime Admina</strong>
          </div>
        </div>

        <nav className="menu">
          <a href="#" className="active">Generalno</a>
          <a href="/adminKom">Komentari</a>
          <a href="/adminKorisnici">Korisnici</a>
        </nav>
      </aside>

      <main className="content">
        <div className="header">
          <h1>Generalno</h1>
          <h2>GENERALNI INFO</h2>
        </div>

        <div className="center">
          <button className="button">Postavi članarinu</button>
        </div>

        <div className="card">Unesi obavijest</div>

        <div className="center">
          <button className="button">Pošalji obavijest</button>
        </div>
      </main>
    </div>
	);
}

