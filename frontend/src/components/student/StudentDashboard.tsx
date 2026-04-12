import Student_Details from "./Student_Details";
import StudentHistory from "./StudentHistory";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getCurrentUser, getSessions, setSessions } from "../../lib/storage";
import type { SessionRecord, User } from "../../types/models";

function StudentDashboard() {
  
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [joinFeedback, setJoinFeedback] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const currentUser = getCurrentUser() as User | null;

  if (!currentUser || currentUser.role !== "student") {
    return null;
  }

  const handleJoinSession = () => {
    setJoinCodeError("");
    setJoinFeedback("");
    const normalizedCode = joinCode.trim().toUpperCase();

    if (!normalizedCode) {
      setJoinCodeError("Session code is required.");
      return;
    }

    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      setJoinCodeError("Session code must be 6 letters or numbers.");
      return;
    }

    setIsJoining(true);

    const sessions = getSessions();
    const session = sessions.find((s) => s.id === normalizedCode);

    if(!session) {
      setJoinCodeError("Session not found. Check the code and try again.");
      setIsJoining(false);
      return;
    }

    if (session.status === "ended") {
      setJoinCodeError("This session has already ended.");
      setIsJoining(false);
      return;
    }

    const updatedSessions: SessionRecord[] = sessions.map((s) => {
      if (s.id !== normalizedCode) {
        return s;
      }

      const currentEnrolledParticipants = s.enrolledParticipants;

      if (currentEnrolledParticipants.includes(currentUser.email)) {
        return s;
      }

      return {
        ...s,
        enrolledParticipants: [...currentEnrolledParticipants, currentUser.email]
      };
    });

    setSessions(updatedSessions);
    setJoinFeedback("Session joined successfully.");
    setIsJoining(false);

    navigate(`/session/${session.id}`);
  }

  return (
    <div className="page"> 
      <h1 className="page-title">Student Dashboard</h1>
      <p className="page-subtitle">Join live sessions, track your participation history, and stay aligned with classroom flow.</p>

      <div className="panel">
        <h2 className="section-title">Join a Session</h2>
        <div className="stack">
          <input
            type="text"
            placeholder="Enter Session Code"
            value={joinCode}
            maxLength={6}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            aria-invalid={Boolean(joinCodeError)}
          />
          {joinCodeError && <p className="field-error">{joinCodeError}</p>}
          {joinFeedback && <p className="field-success">{joinFeedback}</p>}
          <div className="cta-row">
            <button onClick={handleJoinSession} disabled={isJoining}>{isJoining ? "Joining..." : "Join Session"}</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <Student_Details />
      </div>

      <div className="panel">
        <StudentHistory />
      </div>

    </div>
  );
}
export default StudentDashboard;