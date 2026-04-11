import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./SessionHistory.css";

interface User { name: string; email: string; role: "student" | "teacher"; }

function SessionHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);

  const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null"
  ) as User | null;

  useEffect(() => {
    if (!currentUser || currentUser.role !== "teacher") { navigate("/teacher-login"); return; }
    const allSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    setSessions(allSessions.filter((s: any) => s.teacherEmail === currentUser.email));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="sh-section">
      <h2>Session History</h2>
      {sessions.length === 0 ? (
        <div className="sh-empty">
          <div className="sh-empty-icon">📋</div>
          <p>No sessions created yet.</p>
          <p style={{ marginTop: 4, fontSize: "0.85rem" }}>Create your first session above to get started.</p>
        </div>
      ) : (
        <ul className="sh-grid">
          {sessions.map((session) => (
            <li key={session.id} className="sh-card" onClick={() => navigate(`/session/${session.id}`)} style={{ cursor: "pointer" }}>
              <div className="sh-card-top">
                <span className="sh-card-title">{session.title}</span>
                <span className={`sh-status ${session.status === "live" ? "live" : "ended"}`}>
                  <span className="sh-status-dot" />{session.status}
                </span>
              </div>
              <div className="sh-card-meta">
                <div className="sh-meta-row">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {formatDate(session.createdAt)}
                </div>
                <div className="sh-meta-row">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {session.participants?.length || 0} participants
                </div>
              </div>
              <div className="sh-code-badge">{session.id}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionHistory;