import { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import Skills from "./Skills";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/check", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            setToken(null);
            localStorage.removeItem("token");
          }
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const handleLogin = (tok) => {
    setToken(tok);
  };
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  if (!token) {
    return showLogin ? (
      <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
    ) : (
      <Register onSwitch={() => setShowLogin(true)} />
    );
  }
  return <Skills token={token} onLogout={handleLogout} />;
}

export default App;
