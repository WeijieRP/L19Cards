import React, { useEffect, useState } from "react";

const STATUSES = ["ACTIVE", "COMPLETED", "ARCHIVED"];

export default function CardForm({ initialValues, onSubmit, busy, submitText = "Save" }) {
  const [title, setTitle] = useState("");
  const [module_name, setModuleName] = useState("");
  const [module_code, setModuleCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title || "");
    setModuleName(initialValues.module_name || "");
    setModuleCode(initialValues.module_code || "");
    setDescription(initialValues.description || "");
    setStatus((initialValues.status || "ACTIVE").toUpperCase());
  }, [initialValues]);

  function submit(e) {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      module_name: module_name.trim(),
      module_code: module_code.trim(),
      description: description.trim() ? description.trim() : null,
      status,
    });
  }

  return (
    <form onSubmit={submit} className="form">
      <label className="label">Title
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="label">Module Name
        <input className="input" value={module_name} onChange={(e) => setModuleName(e.target.value)} />
      </label>

      <label className="label">Module Code
        <input className="input" value={module_code} onChange={(e) => setModuleCode(e.target.value)} />
      </label>

      <label className="label">Description (optional)
        <textarea className="input textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label className="label">Status
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <button className="btn btn-primary" disabled={busy} type="submit">
        {busy ? "Saving..." : submitText}
      </button>
    </form>
  );
}
