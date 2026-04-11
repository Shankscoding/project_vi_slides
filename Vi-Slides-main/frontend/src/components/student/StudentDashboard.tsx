import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./StudentDashboard.css";

interface User { name: string; email: string; role: "student" | "teacher"; }

// Matches EXACTLY what TeacherDashboard saves:
// { id, title, teacher, teacherEmail, status:"live"|"ended", createdAt, participants:[], questions:[] }
interface Session {
  id: string; title: string; teacher: string; teacherEmail: string;
  status: "live" | "ended" | "paused"; participants: string[]; questions: any[]; createdAt: string;
}

function StudentDashboard() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [mySessions, setMySessions] = useState<Session[]>([]);

  // Check both sessionStorage and localStorage for currentUser
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null") as User | null;

  const loadMySessions = () => {
    const allSessions: Session[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const joined = allSessions.filter(
      (s) => Array.isArray(s.participants) && s.participants.includes(currentUser?.email ?? "")
    );
    setMySessions(joined);
  };

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    if (currentUser.role !== "student") { navigate("/login"); return; }
    loadMySessions();
  }, []);

  const handleJoinSession = () => {
    setJoinError("");
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError("Please enter a session code."); return; }
    setJoining(true);

    setTimeout(() => {
      const sessions: Session[] = JSON.parse(localStorage.getItem("sessions") || "[]");
      console.log("Sessions in localStorage:", sessions.map(s => s.id));
      console.log("Looking for:", code);

      const idx = sessions.findIndex((s) => s.id.toUpperCase() === code);
      if (idx === -1) {
        setJoining(false);
        setJoinError(`Session "${code}" not found. Make sure the teacher has created it.`);
        return;
      }
      if (sessions[idx].status === "ended") {
        setJoining(false);
        setJoinError("This session has already ended.");
        return;
      }
      if (!sessions[idx].participants.includes(currentUser!.email)) {
        sessions[idx].participants.push(currentUser!.email);
        localStorage.setItem("sessions", JSON.stringify(sessions));
      }
      setJoining(false);
      loadMySessions();
      navigate(`/session/${sessions[idx].id}`);
    }, 400);
  };

  const handleLogout = () => { sessionStorage.removeItem("currentUser"); localStorage.removeItem("currentUser"); navigate("/login"); };
  if (!currentUser) return null;

  const liveSessions  = mySessions.filter((s) => s.status === "live");
  const endedSessions = mySessions.filter((s) => s.status === "ended");

  return (
    <div className="sd-root">
      <aside className="sd-sidebar">
        <div className="sd-sidebar__top">
          <div className="sd-logo"><span className="sd-logo__icon">⬡</span><span className="sd-logo__name">Vi-SlideS</span></div>
          <nav className="sd-nav">
            <button className="sd-nav__item sd-nav__item--active"><span className="sd-nav__icon">◈</span> Dashboard</button>
            <button className="sd-nav__item" onClick={() => navigate("/student/profile")}><span className="sd-nav__icon">◎</span> My Profile</button>
          </nav>
        </div>
        <div className="sd-sidebar__bottom">
          <div className="sd-user">
            <div className="sd-user__avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
            <div className="sd-user__info">
              <span className="sd-user__name">{currentUser.name}</span>
              <span className="sd-user__role">Student</span>
            </div>
          </div>
          <button className="sd-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="sd-main">
        <div className="sd-view">
          <div className="sd-view__header">
            <h1 className="sd-view__title">Good day, {currentUser.name.split(" ")[0]} 👋</h1>
            <p className="sd-view__sub">Join a session or pick up where you left off.</p>
          </div>

          <div className="sd-stats">
            <div className="sd-stat-card"><span className="sd-stat-card__val">{mySessions.length}</span><span className="sd-stat-card__label">Sessions joined</span></div>
            <div className="sd-stat-card"><span className="sd-stat-card__val sd-stat-card__val--green">{liveSessions.length}</span><span className="sd-stat-card__label">Live now</span></div>
            <div className="sd-stat-card"><span className="sd-stat-card__val sd-stat-card__val--purple">{endedSessions.length}</span><span className="sd-stat-card__label">Completed</span></div>
          </div>

          <div className="sd-join-box">
            <div className="sd-join-box__header">
              <span className="sd-join-box__icon">⊕</span>
              <h2 className="sd-join-box__title">Join a session</h2>
            </div>
            <p className="sd-join-box__hint">Enter the 6-character code your teacher shared with you.</p>
            <div className="sd-join-row">
              <input className="sd-code-input" type="text" placeholder="e.g. AB12CD"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                maxLength={8} autoComplete="off" />
              <button className="sd-btn sd-btn--primary" onClick={handleJoinSession} disabled={joining}>
                {joining ? <span className="sd-spinner" /> : "Join →"}
              </button>
            </div>
            {joinError && <p className="sd-join-error">⚠ {joinError}</p>}
          </div>

          <div className="sd-section">
            <h2 className="sd-section__title">My sessions</h2>
            {mySessions.length === 0 ? (
              <div className="sd-empty"><span className="sd-empty__icon">◷</span><p>No sessions yet. Enter a code above to join one!</p></div>
            ) : (
              <div className="sd-session-list">
                {mySessions.map((s) => (
                  <div key={s.id} className="sd-session-card">
                    <div className="sd-session-card__left">
                      <span className={`sd-status-dot sd-status-dot--${s.status === "live" ? "active" : "ended"}`} />
                      <div>
                        <p className="sd-session-card__topic">{s.title || "Untitled Session"}</p>
                        <p className="sd-session-card__meta">{s.teacher || "Teacher"} · Code: <code className="sd-code-badge">{s.id}</code></p>
                      </div>
                    </div>
                    {s.status === "live" && <button className="sd-btn sd-btn--primary sd-btn--sm" onClick={() => navigate(`/session/${s.id}`)}>Rejoin →</button>}
                    {s.status === "ended" && <span className="sd-badge sd-badge--ended">Ended</span>}
                    {s.status === "paused" && <span className="sd-badge sd-badge--paused">Paused</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;