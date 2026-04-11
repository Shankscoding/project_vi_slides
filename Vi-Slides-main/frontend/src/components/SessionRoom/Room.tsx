import { Navigate, useNavigate } from "react-router-dom";
import StudentSession from "./StudentSession";
import TeacherSession from "./TeacherSession";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Room.css";

function Room() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") ||
    localStorage.getItem("currentUser") ||
    "null"
  );

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/student-login");
      return;
    }
    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const foundSession = sessions.find((s: any) => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
      setQuestions(foundSession.questions || []);
    }
    setLoading(false);
  }, [sessionId]);

  // Listen for localStorage changes to update questions in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sessions" && sessionId) {
        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const foundSession = sessions.find((s: any) => s.id === sessionId);
        if (foundSession) {
          setQuestions(foundSession.questions || []);
        }
      }
    };

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      if (sessionId) {
        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const foundSession = sessions.find((s: any) => s.id === sessionId);
        if (foundSession) {
          setQuestions(foundSession.questions || []);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdate", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdate", handleCustomStorageChange);
    };
  }, [sessionId]);

  if (!currentUser) {
    return <Navigate to="/student-login" />;
  }

  if (loading) {
    return (
      <div className="room-loading">
        <div className="room-loading__spinner" />
        <p>Loading session…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="room-notfound">
        <div className="room-notfound__icon">⬡</div>
        <h2>Session not found</h2>
        <p>The session code may be invalid or expired.</p>
        <button
          className="room-back-btn"
          onClick={() => navigate(currentUser.role === "teacher" ? "/teacher" : "/student")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="room-root">
      <nav className="room-nav">
        <div className="room-logo">
          <div className="room-logo-hex" />
          Vi-SlideS
        </div>
        <div className="room-nav__right">
          <span className="room-nav__role">
            {currentUser.role === "teacher" ? "🎓 Teacher" : "📚 Student"}
          </span>
          <button
            className="room-nav__back"
            onClick={() => navigate(currentUser.role === "teacher" ? "/teacher" : "/student")}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="room-session-header">
        <div className="room-session-tag">
          <span className={`room-live-dot ${session.status !== "live" ? "room-live-dot--off" : ""}`} />
          {session.status === "live" ? "Live Session" : "Session Ended"}
        </div>
        <h1 className="room-session-title">{session.title}</h1>
        <div className="room-session-meta">
          <span className="room-session-meta__item">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="white" strokeWidth="1.5" />
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {session.teacher}
          </span>
          <span className="room-code-pill">{session.id}</span>
          <span className="room-session-meta__item">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="white" strokeWidth="1.5" />
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {session.participants?.length || 0} students
          </span>
        </div>
      </div>

      <div className="room-body">
        {currentUser.role === "teacher" ? (
          <TeacherSession session={session} questions={questions} setQuestions={setQuestions} />
        ) : (
          <StudentSession session={session} questions={questions} setQuestions={setQuestions} />
        )}
      </div>
    </div>
  );
}

export default Room;