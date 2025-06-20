import { useState } from "react";
import './InstagramAuth.css';

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        onLogin(data.token);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div className="insta-bg">
      <div className="auth-side-image">
        <img src="/skillexchange.jpeg" alt="Skill Exchange Visual" />
      </div>
      <div className="insta-card">
        <img src="/skill-exchange-logo.png" alt="Skill Exchange" className="insta-heading-img" />
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="insta-btn">Login</button>
        </form>
        <p className="insta-message">{message}</p>
        <div className="insta-link">Don't have an account? <b><a onClick={onSwitch} style={{cursor:'pointer'}}>Sign up</a></b></div>
      </div>
    </div>
  );
} 