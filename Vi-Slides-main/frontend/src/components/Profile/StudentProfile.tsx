import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";

interface User { name: string; email: string; role: "student" | "teacher"; }
interface Question {
  id: string; text: string; sessionId: string; sessionTitle: string;
  status: "pending" | "ai-answered" | "teacher-answered";
  answer?: string; answeredBy?: "AI" | "Teacher";
  timestamp: string; anonymous: boolean;
}
interface Session {
  id: string; title: string; teacher: string; teacherEmail: string;
  status: "live" | "ended" | "paused"; participants: string[];
  questions: Question[]; createdAt: string;
}
type Tab = "overview" | "sessions" | "questions" | "edit";

function StudentProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mySessions, setMySessions]   = useState<Session[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [expandedQ, setExpandedQ]     = useState<string | null>(null);
  const [editName, setEditName]       = useState("");
  const [editEmail, setEditEmail]     = useState("");
  const [editPassword, setEditPassword]   = useState("");
  const [editConfirm, setEditConfirm]     = useState("");
  const [editError, setEditError]     = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    // Check both sessionStorage and localStorage for currentUser
    const raw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (!raw) { navigate("/student-login"); return; }
    const user: User = JSON.parse(raw);
    if (user.role !== "student") { navigate("/student-login"); return; }
    setCurrentUser(user); setEditName(user.name); setEditEmail(user.email);

    const allSessions: Session[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const joined = allSessions.filter(s => Array.isArray(s.participants) && s.participants.includes(user.email));
    setMySessions(joined);

    const allQ: Question[] = [];
    joined.forEach(s => {
      (s.questions || []).forEach((q: Question) => allQ.push({ ...q, sessionTitle: s.title, sessionId: s.id }));
    });
    const globalQs: Question[] = JSON.parse(localStorage.getItem(`questions_${user.email}`) || "[]");
    globalQs.forEach(q => {
      const session = joined.find(s => s.id === q.sessionId);
      if (session && !allQ.find(e => e.id === q.id)) allQ.push({ ...q, sessionTitle: session.title });
    });
    setMyQuestions(allQ);
  }, [navigate]);

  const handleLogout = () => { 
    sessionStorage.removeItem("currentUser"); 
    localStorage.removeItem("currentUser"); 
    navigate("/student-login"); 
  };

  const handleUpdateProfile = () => {
    setEditError(""); setEditSuccess(false);
    if (!editName.trim())  { setEditError("Name cannot be empty."); return; }
    if (!editEmail.trim()) { setEditError("Email cannot be empty."); return; }
    if (editPassword && editPassword !== editConfirm) { setEditError("Passwords do not match."); return; }
    if (editPassword && editPassword.length < 6) { setEditError("Password must be at least 6 characters."); return; }
    const updated = { ...currentUser, name: editName.trim(), email: editEmail.trim() };
    localStorage.setItem("currentUser", JSON.stringify(updated));
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const idx = users.findIndex((u: any) => u.email === currentUser?.email);
    if (idx !== -1) {
      users[idx].name = editName.trim(); users[idx].email = editEmail.trim();
      if (editPassword) users[idx].password = editPassword;
      localStorage.setItem("users", JSON.stringify(users));
    }
    setCurrentUser(updated as User); setEditPassword(""); setEditConfirm("");
    setEditSuccess(true); setTimeout(() => setEditSuccess(false), 3000);
  };

  if (!currentUser) return null;
  const initials       = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const answeredQs     = myQuestions.filter(q => q.status !== "pending");
  const aiAnswered     = myQuestions.filter(q => q.answeredBy === "AI");
  const teacherAnswered = myQuestions.filter(q => q.answeredBy === "Teacher");
  const liveSessions   = mySessions.filter(s => s.status === "live");
  const tabs: { key: Tab; label: string }[] = [
    { key: "overview",  label: "Overview" },
    { key: "sessions",  label: `Sessions (${mySessions.length})` },
    { key: "questions", label: `Questions (${myQuestions.length})` },
    { key: "edit",      label: "Edit Profile" },
  ];

  return (
    <div className="sp-root">
      <aside className="sp-sidebar">
        <div className="sp-sidebar__top">
          <div className="sp-logo" onClick={() => navigate("/student")} style={{ cursor: "pointer" }}>
            <span className="sp-logo__icon">⬡</span><span className="sp-logo__name">Vi-SlideS</span>
          </div>
          <nav className="sp-nav">
            <button className="sp-nav__item" onClick={() => navigate("/student")}><span className="sp-nav__icon">◈</span> Dashboard</button>
            <button className="sp-nav__item sp-nav__item--active"><span className="sp-nav__icon">◎</span> My Profile</button>
          </nav>
        </div>
        <div className="sp-sidebar__bottom">
          <div className="sp-user">
            <div className="sp-user__avatar">{initials}</div>
            <div className="sp-user__info">
              <span className="sp-user__name">{currentUser.name}</span>
              <span className="sp-user__role">Student</span>
            </div>
          </div>
          <button className="sp-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="sp-main">
        <div className="sp-view">
          <div className="sp-profile-header">
            <div className="sp-profile-header__avatar">{initials}</div>
            <div className="sp-profile-header__info">
              <h1 className="sp-profile-header__name">{currentUser.name}</h1>
              <p className="sp-profile-header__email">{currentUser.email}</p>
              <span className="sp-role-badge">Student</span>
            </div>
          </div>

          <div className="sp-tabs">
            {tabs.map(t => (
              <button key={t.key} className={`sp-tab ${activeTab === t.key ? "sp-tab--active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="sp-content sp-overview">
              <div className="sp-stats-grid">
                <div className="sp-stat-card"><span className="sp-stat-card__val">{mySessions.length}</span><span className="sp-stat-card__label">Sessions enrolled</span></div>
                <div className="sp-stat-card"><span className="sp-stat-card__val sp-stat-card__val--green">{liveSessions.length}</span><span className="sp-stat-card__label">Live now</span></div>
                <div className="sp-stat-card"><span className="sp-stat-card__val sp-stat-card__val--purple">{myQuestions.length}</span><span className="sp-stat-card__label">Questions asked</span></div>
                <div className="sp-stat-card"><span className="sp-stat-card__val sp-stat-card__val--amber">{answeredQs.length}</span><span className="sp-stat-card__label">Replies received</span></div>
                <div className="sp-stat-card"><span className="sp-stat-card__val">{aiAnswered.length}</span><span className="sp-stat-card__label">AI answers</span></div>
                <div className="sp-stat-card"><span className="sp-stat-card__val sp-stat-card__val--green">{teacherAnswered.length}</span><span className="sp-stat-card__label">Teacher answers</span></div>
              </div>
              <div className="sp-section">
                <h2 className="sp-section__title">Account details</h2>
                <div className="sp-fields">
                  <div className="sp-field"><span className="sp-field__label">Full name</span><span className="sp-field__value">{currentUser.name}</span></div>
                  <div className="sp-field"><span className="sp-field__label">Email</span><span className="sp-field__value">{currentUser.email}</span></div>
                  <div className="sp-field"><span className="sp-field__label">Role</span><span className="sp-field__value" style={{ textTransform: "capitalize" }}>{currentUser.role}</span></div>
                </div>
                <button className="sp-btn sp-btn--outline sp-edit-shortcut" onClick={() => setActiveTab("edit")}>Edit profile →</button>
              </div>
            </div>
          )}

          {/* SESSIONS */}
          {activeTab === "sessions" && (
            <div className="sp-content">
              <div className="sp-section">
                <h2 className="sp-section__title">Enrolled sessions</h2>
                {mySessions.length === 0 ? (
                  <div className="sp-empty"><span className="sp-empty__icon">◷</span><p>No sessions yet.</p><button className="sp-btn sp-btn--primary" onClick={() => navigate("/student")}>Go to Dashboard</button></div>
                ) : (
                  <div className="sp-session-list">
                    {mySessions.map(s => {
                      const sessionQs = myQuestions.filter(q => q.sessionId === s.id);
                      return (
                        <div key={s.id} className="sp-session-card">
                          <div className="sp-session-card__top">
                            <div className="sp-session-card__left">
                              <span className={`sp-dot sp-dot--${s.status === "live" ? "live" : "ended"}`} />
                              <div>
                                <p className="sp-session-card__title">{s.title || "Untitled Session"}</p>
                                <p className="sp-session-card__meta">Teacher: {s.teacher} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                              </div>
                            </div>
                            <div className="sp-session-card__right">
                              <code className="sp-code-badge">{s.id}</code>
                              {s.status === "live" && <button className="sp-btn sp-btn--primary sp-btn--sm" onClick={() => navigate(`/session/${s.id}`)}>Rejoin →</button>}
                              {s.status === "ended" && <span className="sp-badge sp-badge--ended">Ended</span>}
                              {s.status === "paused" && <span className="sp-badge sp-badge--paused">Paused</span>}
                            </div>
                          </div>
                          <div className="sp-session-card__stats">
                            <span>{s.participants?.length || 0} students</span>
                            <span>·</span><span>{sessionQs.length} questions by you</span>
                            <span>·</span><span>{sessionQs.filter(q => q.status !== "pending").length} answered</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {activeTab === "questions" && (
            <div className="sp-content">
              <div className="sp-section">
                <div className="sp-section__header">
                  <h2 className="sp-section__title">All my questions</h2>
                  <div className="sp-q-summary">
                    <span className="sp-q-chip sp-q-chip--ai">AI: {aiAnswered.length}</span>
                    <span className="sp-q-chip sp-q-chip--teacher">Teacher: {teacherAnswered.length}</span>
                    <span className="sp-q-chip sp-q-chip--pending">Pending: {myQuestions.filter(q => q.status === "pending").length}</span>
                  </div>
                </div>
                {myQuestions.length === 0 ? (
                  <div className="sp-empty"><span className="sp-empty__icon">💬</span><p>No questions yet. Join a session and start asking!</p></div>
                ) : (
                  <div className="sp-q-list">
                    {myQuestions.map(q => (
                      <div key={q.id} className={`sp-q-card sp-q-card--${q.status}`} onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                        <div className="sp-q-card__top">
                          <div className="sp-q-card__meta">
                            <StatusBadge status={q.status} />
                            <span className="sp-q-session-tag">📍 {q.sessionTitle || q.sessionId}</span>
                            {q.anonymous && <span className="sp-q-anon">🎭 Anon</span>}
                            {q.timestamp && <span className="sp-q-time">{q.timestamp}</span>}
                          </div>
                          <span className="sp-q-chevron">{expandedQ === q.id ? "▲" : "▼"}</span>
                        </div>
                        <p className="sp-q-text">{q.text}</p>
                        {expandedQ === q.id && q.answer && (
                          <div className="sp-q-answer">
                            <span className="sp-q-answer__label">{q.answeredBy === "AI" ? "🤖 AI Answer" : "👨‍🏫 Teacher Answer"}</span>
                            <p className="sp-q-answer__text">{q.answer}</p>
                          </div>
                        )}
                        {expandedQ === q.id && q.status === "pending" && (
                          <div className="sp-q-pending">⏳ Awaiting response...</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT */}
          {activeTab === "edit" && (
            <div className="sp-content">
              <div className="sp-section">
                <h2 className="sp-section__title">Edit Profile</h2>
                {editError   && <div className="sp-alert sp-alert--error">⚠ {editError}</div>}
                {editSuccess && <div className="sp-alert sp-alert--success">✓ Profile updated successfully!</div>}
                <div className="sp-form">
                  <div className="sp-form-field"><label className="sp-form-label">Full name</label><input className="sp-form-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                  <div className="sp-form-field"><label className="sp-form-label">Email address</label><input className="sp-form-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                  <div className="sp-form-divider">Change password <span>(leave blank to keep current)</span></div>
                  <div className="sp-form-field"><label className="sp-form-label">New password</label><input className="sp-form-input" type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Min. 6 characters" /></div>
                  <div className="sp-form-field"><label className="sp-form-label">Confirm password</label><input className="sp-form-input" type="password" value={editConfirm} onChange={e => setEditConfirm(e.target.value)} placeholder="Repeat new password" /></div>
                  <div className="sp-form-actions">
                    <button className="sp-btn sp-btn--primary" onClick={handleUpdateProfile}>Save changes</button>
                    <button className="sp-btn sp-btn--outline" onClick={() => { setEditName(currentUser.name); setEditEmail(currentUser.email); setEditPassword(""); setEditConfirm(""); setEditError(""); }}>Cancel</button>
                  </div>
                </div>
                <div className="sp-danger-zone">
                  <h3 className="sp-danger-zone__title">Danger zone</h3>
                  <p className="sp-danger-zone__desc">Sign out from your account on this device.</p>
                  <button className="sp-btn sp-btn--danger" onClick={handleLogout}>Sign out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Question["status"] }) {
  if (status === "pending")          return <span className="sp-badge sp-badge--pending">Pending</span>;
  if (status === "ai-answered")      return <span className="sp-badge sp-badge--ai">AI answered</span>;
  if (status === "teacher-answered") return <span className="sp-badge sp-badge--teacher">Teacher answered</span>;
  return null;
}

export default StudentProfile;