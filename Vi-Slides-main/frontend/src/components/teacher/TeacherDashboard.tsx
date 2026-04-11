import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SessionHistory from "./SessionHistory";
import "./TeacherDashboard.css";

interface User { name: string; email: string; role: "student" | "teacher"; }

function TeacherDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [lastCode, setLastCode] = useState("");

  useEffect(() => {
    // Support both sessionStorage and localStorage
    const raw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    const user = JSON.parse(raw || "null") as User | null;
    if (!user || user.role !== "teacher") { navigate("/teacher-login"); }
    else { setCurrentUser(user); }
  }, [navigate]);

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreateSession = () => {
    if (!title.trim()) { alert("Please enter a session title."); return; }
    setCreating(true);
    setTimeout(() => {
      const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
      let code: string;
      do { code = generateCode(); } while (sessions.some((s: any) => s.id === code));
      const newSession = {
        id: code, title: title.trim(),
        teacher: currentUser?.name, teacherEmail: currentUser?.email,
        status: "live", createdAt: new Date().toISOString(),
        participants: [], questions: [],
      };
      sessions.push(newSession);
      localStorage.setItem("sessions", JSON.stringify(sessions));
      console.log("Session created:", newSession);
      setTitle(""); setLastCode(code); setCreating(false);
      navigate(`/session/${code}`);
    }, 400);
  };

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "T";

  if (!currentUser) return null;

  return (
    <div className="td-root">
      <nav className="td-nav">
        <div className="td-logo"><div className="td-logo-hex" /> Vi-SlideS</div>
        <div className="td-nav-right">
          <button className="td-profile-btn" onClick={() => navigate("/teacher/profile")}>My Profile</button>
          <span className="td-nav-name">{currentUser.name}</span>
          <div className="td-avatar">{initials}</div>
        </div>
      </nav>
      <div className="td-body">
        <div className="td-greeting">
          <p className="td-greeting-label">Teacher Dashboard</p>
          <h1>Welcome back, <span>{currentUser.name?.split(" ")[0]}</span></h1>
        </div>
        <div className="td-create-card">
          <h2>Start a New Session</h2>
          <div className="td-input-row">
            <input className="td-input" type="text" placeholder="Enter session title…"
              value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSession()} />
            <button className="td-btn-primary" onClick={handleCreateSession} disabled={creating}>
              {creating ? "Creating…" : "Create Session"}
            </button>
          </div>
          {lastCode && (
            <div className="td-code-hint">
              Session code: <code className="td-code-badge">{lastCode}</code>
              <span> — Share this with your students</span>
            </div>
          )}
        </div>
        <SessionHistory />
      </div>
    </div>
  );
}

export default TeacherDashboard;