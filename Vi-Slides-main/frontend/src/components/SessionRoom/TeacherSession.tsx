import { Navigate } from "react-router-dom";
import { useState } from "react";
import "./TeacherSession.css";

function TeacherSession({ session, questions, setQuestions }: any) {
  const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") ||
    localStorage.getItem("currentUser") ||
    "null"
  );

  if (!currentUser || currentUser.role !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  const [reply, setReply] = useState<{ [key: number]: string }>({});

  const handlereply = (id: number) => {
    if (!reply[id]?.trim()) return;
    const updatedQuestions = questions.map((q: any) => {
      if (q.id === id) return { ...q, answers: reply[id] };
      return q;
    });
    setQuestions(updatedQuestions);
    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const updatedSessions = sessions.map((s: any) => {
      if (s.id === session.id) return { ...s, questions: updatedQuestions };
      return s;
    });
    localStorage.setItem("sessions", JSON.stringify(updatedSessions));
    setReply((prev) => ({ ...prev, [id]: "" }));

    // Dispatch custom event to notify other components of localStorage update
    window.dispatchEvent(new CustomEvent("localStorageUpdate"));
  };

  const answered   = questions.filter((q: any) => q.answers).length;
  const unanswered = questions.length - answered;

  return (
    <div className="ts-root">
      <div className="ts-stats-row">
        <div className="ts-stat-card">
          <div className="ts-stat-number ts-stat-number--purple">{questions.length}</div>
          <div className="ts-stat-label">Total Questions</div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-number ts-stat-number--green">{answered}</div>
          <div className="ts-stat-label">Answered</div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-number ts-stat-number--amber">{unanswered}</div>
          <div className="ts-stat-label">Pending</div>
        </div>
      </div>

      <div className="ts-questions-section">
        <h3>Student Questions</h3>
        {questions.length === 0 ? (
          <div className="ts-empty">
            <div className="ts-empty__icon">🙋</div>
            No questions yet — students will ask questions here.
          </div>
        ) : (
          <ul className="ts-q-list">
            {questions.map((q: any) => (
              <li key={q.id} className={`ts-q-card ${!q.answers ? "ts-q-card--unanswered" : ""}`}>
                <div className="ts-q-header">
                  <div className="ts-q-avatar">
                    {q.askedBy?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="ts-q-main">
                    <p className="ts-q-text">{q.text}</p>
                    <p className="ts-q-by">asked by {q.askedBy}</p>
                  </div>
                  {q.answers
                    ? <span className="ts-badge ts-badge--answered">✓ Answered</span>
                    : <span className="ts-badge ts-badge--pending">⏳ Pending</span>
                  }
                </div>
                {q.answers ? (
                  <div className="ts-answer-block">
                    <div className="ts-answer-label">Your Answer</div>
                    <div className="ts-answer-text">
                      {q.answers.split("\n").map((line: string, idx: number) => (
                        <span key={idx}>{line}<br /></span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ts-reply-area">
                    <input
                      className="ts-reply-input"
                      type="text"
                      value={reply[q.id] || ""}
                      onChange={(e) => setReply((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handlereply(q.id)}
                      placeholder="Type your answer…"
                    />
                    <button
                      className="ts-reply-btn"
                      onClick={() => handlereply(q.id)}
                      disabled={!reply[q.id]?.trim()}
                    >
                      Answer
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TeacherSession;