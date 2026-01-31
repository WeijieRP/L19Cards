import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, readJsonSafe } from "../services/api";
import CardForm from "../components/CardForm"; // ✅ default import

export default function AddCard() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(payload) {
    setErr("");
    setBusy(true);
    try {
      const res = await apiFetch("/api/addcard", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await readJsonSafe(res);
      if (!res.ok) throw new Error(json?.error || `Add failed (${res.status})`);
      nav("/cards");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Add Card</h2>
          <div className="muted">Create a new card</div>
        </div>
      </div>

      {err ? <div className="alert alert-error">{err}</div> : null}

      <div className="glassPanel">
        <CardForm onSubmit={onSubmit} busy={busy} submitText="Create Card" />
      </div>
    </div>
  );
}
