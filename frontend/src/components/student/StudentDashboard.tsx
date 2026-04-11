import Student_Details from "./Student_Details";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
interface User {
    name: string;
    email: string;
    role: "student" | "teacher";
}

function StudentDashboard() {
  
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null") as User | null;

  const handleJoinSession = () => {
    if (!joinCode.trim()) {return alert("Please enter a session code");}

    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const session = sessions.find((s: any) => s.id === joinCode.trim().toUpperCase());

    if(!session) {
      return alert("Session not found. Please check the code and try again.");
    }

    if(!session.participants.includes(currentUser?.email)) {
      session.participants.push(currentUser?.email);
      localStorage.setItem("sessions", JSON.stringify(sessions));
      window.dispatchEvent(new Event("sessionsUpdated"));
    }

    navigate(`/session/${session.id}`);
  }

  return (
    <div className="page"> 
      <h1 className="page-title">Student Dashboard</h1>
      <p className="page-subtitle">Welcome to your dashboard! Here you can view your courses, assignments, and progress.</p>

      <div className="panel">
        <h2 className="panel-title">Join a Session</h2>
        <div className="stack">
          <input
            type="text"
            placeholder="Enter Session Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button onClick={handleJoinSession}>Join Session</button>
        </div>
      </div>

      <div className="panel">
        <Student_Details />
      </div>

    </div>
  );
}
export default StudentDashboard;