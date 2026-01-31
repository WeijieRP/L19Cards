import React from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Card({ item, onDelete, busyDelete }) {
  const status = String(item.status || "ACTIVE").toUpperCase();

  return (
    <div className="cardRow glassCard">
      <div>
        <div className="cardTitle">{item.title}</div>
        <div className="cardMeta">{item.module_name} • {item.module_code}</div>
        {item.description ? <div className="cardDesc">{item.description}</div> : null}
      </div>

      <div className="cardRight">
        <div className={`pill pill-${status}`}>{status}</div>
        <div className="cardActions">
          <Link className="btn btn-outline btn-sm" to={`/cards/edit/${item.id}`}>
            <FiEdit2 /> Edit
          </Link>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)} disabled={busyDelete}>
            <FiTrash2 /> {busyDelete ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
