import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container page">
      <div className="homeHero">
        <h2 className="pageTitle">Welcome 👋</h2>
        <p className="muted">Manage your module cards with CRA + JWT + Aiven MySQL.</p>

        <div className="homeCtas">
          <Link className="btn btn-primary" to="/cards">View Cards</Link>
          <Link className="btn btn-outline" to="/cards/new">Add Card</Link>
        </div>
      </div>
    </div>
  );
}
