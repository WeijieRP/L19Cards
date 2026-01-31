import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch, readJsonSafe } from "../services/api";
import CardForm from "../components/CardForm";

export default function EditCard() {
  const { id } = useParams();
  const nav = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr("");
    const res = await apiFetch(`/api/cards/${id}`);
    const json = await readJsonSafe(res);
    if (!res.ok) {
      setErr(json?.error || `Load failed (${res.status})`);
      setInitialValues(null);
      return;
    }
    setInitialValues(json);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function onSubmit(payload) {
    setErr("");
    setBusy(true);
    try {
      const res = await apiFetch(`/api/cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const json = await readJsonSafe(res);
      if (!res.ok) throw new Error(json?.error || `Update failed (${res.status})`);
      nav("/cards");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!initialValues) return <div className="container"><div className="info">Loading…</div></div>;

  return (
    <div className="container page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Edit Card</h2>
          <div className="muted">Update your card</div>
        </div>
      </div>

      {err ? <div className="alert alert-error">{err}</div> : null}

      <div className="glassPanel">
        <CardForm initialValues={initialValues} onSubmit={onSubmit} busy={busy} submitText="Save" />
      </div>
    </div>
  );
}
