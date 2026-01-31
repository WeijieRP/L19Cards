import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const auth = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await auth.login(username, password);
      nav("/", { replace: true });
    } catch (e2) {
      setErr(String(e2.message || e2));
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h1 className="authTitle">Login</h1>
        <p className="muted">Use a user from <b>app_accounts</b> (bcrypt password_hash)</p>

        {err ? <div className="alert alert-error">{err}</div> : null}

        <form onSubmit={submit} className="form">
          <label className="label">Username
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label className="label">Password
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <button className="btn btn-primary" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
