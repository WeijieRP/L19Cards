import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import { apiFetch, readJsonSafe } from "../services/api";
import Card from "../components/Card";

export default function CardList() {
  const [cards, setCards] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [busyDeleteId, setBusyDeleteId] = useState(null);

  async function load() {
    setError("");
    try {
      const res = await apiFetch("/api/allcards");
      const json = await readJsonSafe(res);
      if (!res.ok) throw new Error(json?.error || `Load failed (${res.status})`);
      setCards(Array.isArray(json) ? json : []);
    } catch (e) {
      setCards([]);
      setError(String(e.message || e));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this card?")) return;
    setBusyDeleteId(id);
    try {
      const res = await apiFetch(`/api/cards/${id}`, { method: "DELETE" });
      const json = await readJsonSafe(res);
      if (!res.ok) throw new Error(json?.error || `Delete failed (${res.status})`);
      await load();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusyDeleteId(null);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(cards) ? cards : [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c) =>
      `${c.title || ""} ${c.module_name || ""} ${c.module_code || ""} ${c.status || ""} ${c.description || ""}`
        .toLowerCase()
        .includes(s)
    );
  }, [cards, q]);

  return (
    <div className="container page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Cards</h2>
          <div className="muted">Manage your module cards</div>
        </div>

        <Link className="btn btn-primary" to="/cards/new">
          <FiPlus /> Add Card
        </Link>
      </div>

      <div className="searchBar">
        <FiSearch />
        <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="countLine">{filtered.length} items</div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stack">
        {filtered.map((c) => (
          <Card
            key={c.id}
            item={c}
            onDelete={handleDelete}
            busyDelete={busyDeleteId === c.id}
          />
        ))}
      </div>
    </div>
  );
}
