import { useState } from "react";

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleJoin = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    onJoin(trimmed, role);
  };

  return (
    <div className="join-screen">
      <div className="join-card">
        <div className="join-logo">
          <span className="logo-icon">◈</span>
          <h1>CourseChat</h1>
        </div>
        <p className="join-subtitle">Real-time course discussions &amp; supervision</p>

        <div className="field">
          <label htmlFor="username">Your name</label>
          <input
            id="username"
            type="text"
            placeholder="e.g. Alice"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            autoFocus
            maxLength={30}
          />
        </div>

        <div className="field">
          <label>Join as</label>
          <div className="role-picker">
            <button
              className={`role-btn ${role === "student" ? "active" : ""}`}
              onClick={() => setRole("student")}
            >
              🎓 Student
            </button>
            <button
              className={`role-btn ${role === "teacher" ? "active" : ""}`}
              onClick={() => setRole("teacher")}
            >
              🏫 Teacher
            </button>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="join-btn" onClick={handleJoin}>
          Enter Chat →
        </button>
      </div>
    </div>
  );
}