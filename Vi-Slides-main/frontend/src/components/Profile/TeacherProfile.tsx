import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherProfile.css";

interface User { name: string; email: string; role: "student" | "teacher"; }
interface Question {
  id: string; text: string; askedBy: string;
  answers?: string; timestamp?: string;
  sessionTitle?: string; sessionId?: string;
}
interface Session {
  id: string; title: string; teacher: string; teacherEmail: string;
  status: "live" | "ended" | "paused"; participants: string[];
  questions: Question[]; createdAt: string;
}
type Tab = "overview" | "sessions" | "questions" | "edit";

function TeacherProfile() {
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
    if (!raw) { navigate("/teacher-login"); return; }
    const user: User = JSON.parse(raw);
    if (user.role !== "teacher") { navigate("/teacher-login"); return; }
    setCurrentUser(user); setEditName(user.name); setEditEmail(user.email);

    const allSessions: Session[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const created = allSessions.filter(s => s.teacherEmail === user.email);
    setMySessions(created);

    const allQ: Question[] = [];
    created.forEach(s => {
      (s.questions || []).forEach((q: Question) => allQ.push({ ...q, sessionTitle: s.title, sessionId: s.id }));
    });
    setMyQuestions(allQ);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    navigate("/teacher-login");
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
  const answeredQs     = myQuestions.filter(q => q.answers);
  const liveSessions   = mySessions.filter(s => s.status === "live");
  const totalStudents  = mySessions.reduce((sum, s) => sum + (s.participants?.length || 0), 0);
  const tabs: { key: Tab; label: string }[] = [
    { key: "overview",  label: "Overview" },
    { key: "sessions",  label: `Sessions (${mySessions.length})` },
    { key: "questions", label: `Questions (${myQuestions.length})` },
    { key: "edit",      label: "Edit Profile" },
  ];

  return (
    <div className="tp-root">
      <aside className="tp-sidebar">
        <div className="tp-sidebar__top">
          <div className="tp-logo" onClick={() => navigate("/teacher")} style={{ cursor: "pointer" }}>
            <span className="tp-logo__icon">⬡</span><span className="tp-logo__name">Vi-SlideS</span>
          </div>
          <nav className="tp-nav">
            <button className="tp-nav__item" onClick={() => navigate("/teacher")}><span className="tp-nav__icon">◈</span> Dashboard</button>
            <button className="tp-nav__item tp-nav__item--active"><span className="tp-nav__icon">◎</span> My Profile</button>
          </nav>
        </div>
        <div className="tp-sidebar__bottom">
          <div className="tp-user">
            <div className="tp-user__avatar">{initials}</div>
            <div className="tp-user__info">
              <span className="tp-user__name">{currentUser.name}</span>
              <span className="tp-user__role">Teacher</span>
            </div>
          </div>
          <button className="tp-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="tp-main">
        <div className="tp-view">
          <div className="tp-profile-header">
            <div className="tp-profile-header__avatar">{initials}</div>
            <div className="tp-profile-header__info">
              <h1 className="tp-profile-header__name">{currentUser.name}</h1>
              <p className="tp-profile-header__email">{currentUser.email}</p>
              <span className="tp-role-badge">Teacher</span>
            </div>
          </div>

          <div className="tp-tabs">
            {tabs.map(t => (
              <button key={t.key} className={`tp-tab ${activeTab === t.key ? "tp-tab--active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="tp-content tp-overview">
              <div className="tp-stats-grid">
                <div className="tp-stat-card"><span className="tp-stat-card__val">{mySessions.length}</span><span className="tp-stat-card__label">Sessions created</span></div>
                <div className="tp-stat-card"><span className="tp-stat-card__val tp-stat-card__val--green">{liveSessions.length}</span><span className="tp-stat-card__label">Live now</span></div>
                <div className="tp-stat-card"><span className="tp-stat-card__val tp-stat-card__val--purple">{myQuestions.length}</span><span className="tp-stat-card__label">Questions received</span></div>
                <div className="tp-stat-card"><span className="tp-stat-card__val tp-stat-card__val--amber">{answeredQs.length}</span><span className="tp-stat-card__label">Questions answered</span></div>
                <div className="tp-stat-card"><span className="tp-stat-card__val">{totalStudents}</span><span className="tp-stat-card__label">Total students</span></div>
                <div className="tp-stat-card"><span className="tp-stat-card__val tp-stat-card__val--green">{myQuestions.length - answeredQs.length}</span><span className="tp-stat-card__label">Pending questions</span></div>
              </div>
              <div className="tp-section">
                <h2 className="tp-section__title">Account details</h2>
                <div className="tp-fields">
                  <div className="tp-field"><span className="tp-field__label">Full name</span><span className="tp-field__value">{currentUser.name}</span></div>
                  <div className="tp-field"><span className="tp-field__label">Email</span><span className="tp-field__value">{currentUser.email}</span></div>
                  <div className="tp-field"><span className="tp-field__label">Role</span><span className="tp-field__value" style={{ textTransform: "capitalize" }}>{currentUser.role}</span></div>
                </div>
                <button className="tp-btn tp-btn--outline tp-edit-shortcut" onClick={() => setActiveTab("edit")}>Edit profile →</button>
              </div>
            </div>
          )}

          {/* SESSIONS */}
          {activeTab === "sessions" && (
            <div className="tp-content">
              <div className="tp-section">
                <h2 className="tp-section__title">Created sessions</h2>
                {mySessions.length === 0 ? (
                  <div className="tp-empty"><span className="tp-empty__icon">◷</span><p>No sessions created yet.</p><button className="tp-btn tp-btn--primary" onClick={() => navigate("/teacher")}>Go to Dashboard</button></div>
                ) : (
                  <div className="tp-session-list">
                    {mySessions.map(s => {
                      const sessionQs = myQuestions.filter(q => q.sessionId === s.id);
                      const answeredCount = sessionQs.filter(q => q.answers).length;
                      return (
                        <div key={s.id} className="tp-session-card">
                          <div className="tp-session-card__top">
                            <div className="tp-session-card__left">
                              <span className={`tp-dot tp-dot--${s.status === "live" ? "live" : "ended"}`} />
                              <div>
                                <p className="tp-session-card__title">{s.title || "Untitled Session"}</p>
                                <p className="tp-session-card__meta">Created: {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                              </div>
                            </div>
                            <div className="tp-session-card__right">
                              <code className="tp-code-badge">{s.id}</code>
                              {s.status === "live" && <button className="tp-btn tp-btn--primary tp-btn--sm" onClick={() => navigate(`/session/${s.id}`)}>Open →</button>}
                              {s.status === "ended" && <span className="tp-badge tp-badge--ended">Ended</span>}
                              {s.status === "paused" && <span className="tp-badge tp-badge--paused">Paused</span>}
                            </div>
                          </div>
                          <div className="tp-session-card__stats">
                            <span>{s.participants?.length || 0} students</span>
                            <span>·</span><span>{sessionQs.length} questions</span>
                            <span>·</span><span>{answeredCount} answered</span>
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
            <div className="tp-content">
              <div className="tp-section">
                <div className="tp-section__header">
                  <h2 className="tp-section__title">All questions from my sessions</h2>
                  <div className="tp-q-summary">
                    <span className="tp-q-chip tp-q-chip--answered">Answered: {answeredQs.length}</span>
                    <span className="tp-q-chip tp-q-chip--pending">Pending: {myQuestions.length - answeredQs.length}</span>
                  </div>
                </div>
                {myQuestions.length === 0 ? (
                  <div className="tp-empty"><span className="tp-empty__icon">💬</span><p>No questions received yet. Students will ask questions during your sessions!</p></div>
                ) : (
                  <div className="tp-q-list">
                    {myQuestions.map(q => (
                      <div key={q.id} className={`tp-q-card tp-q-card--${q.answers ? "answered" : "pending"}`} onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                        <div className="tp-q-card__top">
                          <div className="tp-q-card__meta">
                            <StatusBadge answered={!!q.answers} />
                            <span className="tp-q-session-tag">📍 {q.sessionTitle || q.sessionId}</span>
                            <span className="tp-q-asked-by">👤 {q.askedBy}</span>
                            {q.timestamp && <span className="tp-q-time">{q.timestamp}</span>}
                          </div>
                          <span className="tp-q-chevron">{expandedQ === q.id ? "▲" : "▼"}</span>
                        </div>
                        <p className="tp-q-text">{q.text}</p>
                        {expandedQ === q.id && q.answers && (
                          <div className="tp-q-answer">
                            <span className="tp-q-answer__label">Your Answer</span>
                            <p className="tp-q-answer__text">{q.answers}</p>
                          </div>
                        )}
                        {expandedQ === q.id && !q.answers && (
                          <div className="tp-q-pending">⏳ Not answered yet</div>
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
            <div className="tp-content">
              <div className="tp-section">
                <h2 className="tp-section__title">Edit Profile</h2>
                {editError   && <div className="tp-alert tp-alert--error">⚠ {editError}</div>}
                {editSuccess && <div className="tp-alert tp-alert--success">✓ Profile updated successfully!</div>}
                <div className="tp-form">
                  <div className="tp-form-field"><label className="tp-form-label">Full name</label><input className="tp-form-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                  <div className="tp-form-field"><label className="tp-form-label">Email address</label><input className="tp-form-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                  <div className="tp-form-divider">Change password <span>(leave blank to keep current)</span></div>
                  <div className="tp-form-field"><label className="tp-form-label">New password</label><input className="tp-form-input" type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Min. 6 characters" /></div>
                  <div className="tp-form-field"><label className="tp-form-label">Confirm password</label><input className="tp-form-input" type="password" value={editConfirm} onChange={e => setEditConfirm(e.target.value)} placeholder="Repeat new password" /></div>
                  <div className="tp-form-actions">
                    <button className="tp-btn tp-btn--primary" onClick={handleUpdateProfile}>Save changes</button>
                    <button className="tp-btn tp-btn--outline" onClick={() => { setEditName(currentUser.name); setEditEmail(currentUser.email); setEditPassword(""); setEditConfirm(""); setEditError(""); }}>Cancel</button>
                  </div>
                </div>
                <div className="tp-danger-zone">
                  <h3 className="tp-danger-zone__title">Danger zone</h3>
                  <p className="tp-danger-zone__desc">Sign out from your account on this device.</p>
                  <button className="tp-btn tp-btn--danger" onClick={handleLogout}>Sign out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ answered }: { answered: boolean }) {
  if (answered) return <span className="tp-badge tp-badge--answered">✓ Answered</span>;
  return <span className="tp-badge tp-badge--pending">⏳ Pending</span>;
}

export default TeacherProfile;