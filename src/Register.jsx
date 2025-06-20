import { useState } from "react";
import './InstagramAuth.css';

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Please login.");
        setEmail("");
        setUsername("");
        setPassword("");
      } else {
        setMessage(data.message || "Registration failed");
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
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="insta-btn">Sign Up</button>
        </form>
        <p className={`insta-message${message && !message.toLowerCase().includes('success') ? ' error' : ''}`}>{message}</p>
        <div className="insta-link">Already have an account? <b><a onClick={onSwitch} style={{cursor:'pointer'}}>Login</a></b></div>
      </div>
    </div>
  );
} 