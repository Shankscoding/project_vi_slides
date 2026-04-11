import { Navigate } from "react-router-dom";
import { useState } from "react";
import "./StudentSession.css";

function StudentSession({ session, questions, setQuestions }: any) {
  const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") ||
    localStorage.getItem("currentUser") ||
    "null"
  );

  if (!currentUser || currentUser.role !== "student") {
    return <Navigate to="/student-login" />;
  }

  const [question, setquestion] = useState("");

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    const newQuestion = {
      text: question.trim(),
      askedBy: currentUser.name,
      id: Date.now(),
      answers: "",
    };
    setQuestions([...questions, newQuestion]);
    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const updatedSessions = sessions.map((s: any) => {
      if (s.id === session.id) {
        return { ...s, questions: [...(s.questions || []), newQuestion] };
      }
      return s;
    });
    localStorage.setItem("sessions", JSON.stringify(updatedSessions));
    setquestion("");

    // Dispatch custom event to notify other components of localStorage update
    window.dispatchEvent(new CustomEvent("localStorageUpdate"));
  };

  const myQuestions = questions.filter((q: any) => q.askedBy === currentUser.name);
  const answered = myQuestions.filter((q: any) => q.answers).length;

  return (
    <div className="ss-root">
      <div className="ss-stats-row">
        <div className="ss-stat-card">
          <span className="ss-stat-val">{questions.length}</span>
          <span className="ss-stat-label">Total questions</span>
        </div>
        <div className="ss-stat-card">
          <span className="ss-stat-val ss-stat-val--purple">{myQuestions.length}</span>
          <span className="ss-stat-label">Asked by you</span>
        </div>
        <div className="ss-stat-card">
          <span className="ss-stat-val ss-stat-val--green">{answered}</span>
          <span className="ss-stat-label">Answered</span>
        </div>
      </div>

      <div className="ss-ask-card">
        <div className="ss-ask-label">Ask a Question</div>
        <div className="ss-input-row">
          <input
            className="ss-input"
            type="text"
            value={question}
            onChange={(e) => setquestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
            placeholder="Type your question here…"
          />
          <button className="ss-btn" onClick={handleAskQuestion} disabled={!question.trim()}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L2 7.5l5.5 1L9 14l5-12z" fill="white" stroke="white" strokeWidth="0.5" />
            </svg>
            Ask
          </button>
        </div>
      </div>

      <div className="ss-questions-section">
        <h3>Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <div className="ss-empty">
            <div className="ss-empty__icon">🙋</div>
            No questions yet — be the first to ask!
          </div>
        ) : (
          <ul className="ss-q-list">
            {questions.map((q: any) => (
              <li key={q.id} className={`ss-q-card ${q.askedBy === currentUser.name ? "ss-q-card--mine" : ""}`}>
                <div className="ss-q-header">
                  <div className="ss-q-avatar">
                    {q.askedBy?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="ss-q-main">
                    <p className="ss-q-text">{q.text}</p>
                    <p className="ss-q-by">
                      asked by {q.askedBy}
                      {q.askedBy === currentUser.name && <span className="ss-q-you"> · you</span>}
                    </p>
                  </div>
                  {q.answers
                    ? <span className="ss-badge ss-badge--answered">✓ Answered</span>
                    : <span className="ss-badge ss-badge--pending">⏳ Pending</span>
                  }
                </div>
                {q.answers ? (
                  <div className="ss-answer-block">
                    <div className="ss-answer-label">Answer</div>
                    <div className="ss-answer-text">
                      {q.answers.split("\n").map((line: string, idx: number) => (
                        <span key={idx}>{line}<br /></span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ss-unanswered-badge">⏳ Awaiting teacher's response</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StudentSession;