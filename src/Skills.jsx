import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

function ChatWindow({ token, otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const userId = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Decode userId from token (simple base64 decode for demo, use a library in production)
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId.current = payload.userId;

    fetch(`http://localhost:5000/api/chat/${otherUser._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join", { userId: userId.current, otherUserId: otherUser._id });

    socketRef.current.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [otherUser, token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;
    // Save to DB
    await fetch(`http://localhost:5000/api/chat/${otherUser._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: input })
    });
    // Emit real-time
    socketRef.current.emit("send_message", {
      userId: userId.current,
      otherUserId: otherUser._id,
      content: input
    });
    setInput("");
  };

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <span className="chatbot-avatar">{otherUser.email[0].toUpperCase()}</span>
        <span className="chatbot-title">{otherUser.username || otherUser.email}</span>
        <button className="chatbot-close" onClick={onClose} title="Close chat">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.userId === userId.current ? "chatbot-msg-me" : "chatbot-msg-them"}>
            <div className="chatbot-msg-meta">
              <span className="chatbot-msg-sender">{msg.userId === userId.current ? "You" : (otherUser.username || otherUser.email)}</span>
              <span className="chatbot-msg-time">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}</span>
            </div>
            <div className="chatbot-msg-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' ? sendMessage() : null}
          placeholder="Type a message..."
        />
        <button className="chatbot-send" onClick={sendMessage} title="Send">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 17l13.5-7.5L3 3v5l9 1.5-9 1.5v5z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function Skills({ token, onLogout }) {
  const [skills, setSkills] = useState([]);
  const [wantsToLearn, setWantsToLearn] = useState([]);
  const [inputSkill, setInputSkill] = useState("");
  const [inputWant, setInputWant] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);

  // For editing
  const [editSkills, setEditSkills] = useState([]);
  const [editWants, setEditWants] = useState([]);
  const [editInputSkill, setEditInputSkill] = useState("");
  const [editInputWant, setEditInputWant] = useState("");

  // Decode email and username from JWT if not provided by API
  function getUserInfoFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email || '',
        username: payload.username || ''
      };
    } catch {
      return { email: '', username: '' };
    }
  }

  useEffect(() => {
    fetch("http://localhost:5000/api/skills", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSkills(data.skills || []);
        setWantsToLearn(data.wantsToLearn || []);
        setLoading(false);
        if (data.email) setUserEmail(data.email);
        else setUserEmail(getUserInfoFromToken(token).email);
        if (data.username) setUsername(data.username);
        else setUsername(getUserInfoFromToken(token).username);
      })
      .catch(() => {
        const info = getUserInfoFromToken(token);
        setUserEmail(info.email);
        setUsername(info.username);
        setLoading(false);
      });
  }, [token]);

  const handleAddSkill = () => {
    if (editInputSkill && !editSkills.includes(editInputSkill)) {
      setEditSkills([...editSkills, editInputSkill]);
      setEditInputSkill("");
    }
  };
  const handleAddWant = () => {
    if (editInputWant && !editWants.includes(editInputWant)) {
      setEditWants([...editWants, editInputWant]);
      setEditInputWant("");
    }
  };
  const handleRemoveSkill = (skill) => {
    setEditSkills(editSkills.filter(s => s !== skill));
  };
  const handleRemoveWant = (want) => {
    setEditWants(editWants.filter(w => w !== want));
  };

  const handleSave = async () => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ skills: editSkills, wantsToLearn: editWants })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile saved!");
        setSkills(editSkills);
        setWantsToLearn(editWants);
        setShowUpdate(false);
      } else setMessage(data.message || "Failed to save profile");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const findMatches = async () => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/match", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMatches(data.matches || []);
      if (!data.matches.length) setMessage("No matches found");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  // Determine if profile should be centered
  const shouldCenterProfile = !showUpdate && matches.length === 0;

  if (loading) return <div className="insta-profile-bg"><div className="insta-profile-card"><p>Loading...</p></div></div>;

  return (
    <div className={shouldCenterProfile ? "profile-flex-row centered" : "profile-flex-row"}>
      <div className="insta-profile-bg" style={{boxShadow: 'none', background: 'none', minHeight: 0, paddingTop: 0}}>
        <div className="insta-profile-card">
          <div className="insta-profile-header">
            <div className="insta-profile-avatar">
              {username ? username[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : <span>U</span>)}
            </div>
            <div className="insta-profile-username">{username}</div>
            <div className="insta-profile-email">{userEmail}</div>
          </div>
          <h2 className="insta-profile-title" style={{marginTop: '0.3rem', marginBottom: '0.7rem'}}>Profile</h2>
          <div className="skills-row">
            <div className="skills-block">
              <h3>Expertise</h3>
              <div className="skills-list">
                {skills.length === 0 && <span style={{color:'#888'}}>None</span>}
                {skills.map((skill, i) => <span key={i} className="skill-tag">{skill}</span>)}
              </div>
            </div>
            <div className="skills-block">
              <h3>Learning Goals</h3>
              <div className="skills-list">
                {wantsToLearn.length === 0 && <span style={{color:'#888'}}>None</span>}
                {wantsToLearn.map((want, i) => <span key={i} className="skill-tag want-tag">{want}</span>)}
              </div>
            </div>
          </div>
          <div className="actions-block" style={{marginTop: '1.5rem'}}>
            <div className="actions-row">
              <button className="action-btn" onClick={() => {
                setEditSkills(skills);
                setEditWants(wantsToLearn);
                setEditInputSkill("");
                setEditInputWant("");
                setShowUpdate(true);
                setMatches([]); // Hide matches when updating skills
              }}>Update Skills</button>
              <button className="action-btn" onClick={() => {
                setShowUpdate(false); // Hide update skills when finding matches
                findMatches();
              }}>Find Matches</button>
            </div>
            <span className="logout-link" onClick={onLogout}>Logout</span>
            <div className="profile-message">{message}</div>
          </div>
        </div>
      </div>
      {/* Right column: show either update skills or matches/chat, never both */}
      <div className="matches-side-block">
        {showUpdate ? (
          <div className="update-skills-container">
            <h3>Edit Skills you can teach</h3>
            <div className="skills-list">
              {editSkills.length === 0 && <span style={{color:'#888'}}>None</span>}
              {editSkills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}
                  <span className="remove-skill-x" title="Remove" onClick={() => handleRemoveSkill(skill)}>&times;</span>
                </span>
              ))}
            </div>
            <div className="update-skill-input-row">
              <input
                type="text"
                placeholder="Add a skill"
                value={editInputSkill}
                onChange={e => setEditInputSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' ? handleAddSkill() : null}
              />
              <button className="save" onClick={handleAddSkill}>Add</button>
            </div>
            <h3>Edit Skills you want to learn</h3>
            <div className="skills-list">
              {editWants.length === 0 && <span style={{color:'#888'}}>None</span>}
              {editWants.map((want, i) => (
                <span key={i} className="skill-tag want-tag">{want}
                  <span className="remove-skill-x" title="Remove" onClick={() => handleRemoveWant(want)}>&times;</span>
                </span>
              ))}
            </div>
            <div className="update-skill-input-row">
              <input
                type="text"
                placeholder="Add a skill to learn"
                value={editInputWant}
                onChange={e => setEditInputWant(e.target.value)}
                onKeyDown={e => e.key === 'Enter' ? handleAddWant() : null}
              />
              <button className="save" onClick={handleAddWant}>Add</button>
            </div>
            <div className="actions-block">
              <button className="save" onClick={handleSave}>Save</button>
              <button className="logout" onClick={() => setShowUpdate(false)}>Cancel</button>
              <p>{message}</p>
            </div>
          </div>
        ) : matches.length > 0 ? (
          <>
            <div className="matches-header-row">
              <span className="matches-header-title">Matches</span>
              <span className="matches-header-close" title="Close" onClick={() => setMatches([])}>&times;</span>
            </div>
            <div className="matches-section">
              <ul>
                {matches.map(user => (
                  <li key={user._id}>
                    <span className="avatar">{user.email[0].toUpperCase()}</span>
                    <span className="match-info">
                      <b>{user.email}</b>
                      <span className="match-skills">
                        <span className="skill-tag">Can teach: {user.skills.join(", ")}</span>
                        <span className="skill-tag want-tag">Wants: {user.wantsToLearn.join(", ")}</span>
                      </span>
                    </span>
                    <button onClick={() => setChatUser(user)}>Chat</button>
                  </li>
                ))}
              </ul>
            </div>
            {chatUser && <div className="chat-below-matches"><ChatWindow token={token} otherUser={chatUser} onClose={() => setChatUser(null)} /></div>}
          </>
        ) : null}
      </div>
    </div>
  );
} 