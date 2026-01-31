import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiClipboard, FiPlus, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const auth = useAuth();

  if (!auth || auth.loading) return null;
  if (!auth.isAuthed) return null;

  const isActive = (p) => (loc.pathname === p ? "navlink navlink-active" : "navlink");

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <div className="brand-title">L19 Cards</div>
            <div className="brand-sub">Aiven • MySQL2 • JWT</div>
          </div>
        </div>

        <div className="navlinks">
          <Link className={isActive("/")} to="/"><FiHome /> Home</Link>
          <Link className={isActive("/cards")} to="/cards"><FiClipboard /> Cards</Link>
          <Link className={isActive("/cards/new")} to="/cards/new"><FiPlus /> Add</Link>
        </div>

        <div className="navright">
          <span className="muted">Hi, {auth.user?.username || "User"}</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              auth.logout();
              nav("/login", { replace: true });
            }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
