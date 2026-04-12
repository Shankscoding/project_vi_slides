import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import SessionHistory from "./SessionHistory";
import { getCurrentUser, getSessions, setSessions } from "../../lib/storage";
import type { SessionRecord, User } from "../../types/models";

function TeacherDashboard() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [liveParticipants, setLiveParticipants] = useState(0);
    const [enrolledParticipants, setEnrolledParticipants] = useState(0);

    useEffect(() => {
        const user = getCurrentUser();
        if (user && user.role === "teacher") {
            setCurrentUser(user);
        }
    }, [navigate]);

    useEffect(() => {
      const loadParticipants = () => {
        const user = getCurrentUser();
        if (!user || user.role !== "teacher") {
          return;
        }

        const allSessions = getSessions();
        const teacherSessions = allSessions.filter((s) => s.teacherEmail === user.email);
        const totalLiveParticipants = teacherSessions.reduce((sum, s) => {
          const live = s.liveParticipants.length;
          return sum + live;
        }, 0);

        const totalEnrolledParticipants = teacherSessions.reduce((sum, s) => {
          const enrolled = s.enrolledParticipants.length;
          return sum + enrolled;
        }, 0);

        setLiveParticipants(totalLiveParticipants);
        setEnrolledParticipants(totalEnrolledParticipants);
      };

      loadParticipants();

      const handleStorage = (event: StorageEvent) => {
        if (event.key === "sessions") {
          loadParticipants();
        }
      };

      window.addEventListener("sessionsUpdated", loadParticipants);
      window.addEventListener("storage", handleStorage);

      return () => {
        window.removeEventListener("sessionsUpdated", loadParticipants);
        window.removeEventListener("storage", handleStorage);
      };
    }, []);

    const generateCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const handleCreateSession = () => {
      setTitleError("");
      setFormMessage("");
      const cleanTitle = title.trim();

      if(!cleanTitle) {
        setTitleError("Session title is required.");
        return;
      }

      if (cleanTitle.length < 3) {
        setTitleError("Session title must be at least 3 characters.");
        return;
      }

      setIsCreating(true);
      const session = getSessions();

      let code:string;
      do {
        code = generateCode();
      } while (session.some((s) => s.id === code));

      const newSession: SessionRecord = {
        id:code,
        title: cleanTitle,
        teacher: currentUser?.name || "",
        teacherEmail: currentUser?.email || "",
        status:"live",
        createdAt: new Date().toISOString(),
        enrolledParticipants: [],
        liveParticipants: [],
        questions: []
      };
      session.push(newSession);
      setSessions(session);
      setTitle("");
      setFormMessage(`Session created with code ${code}.`);
      setIsCreating(false);


      navigate(`/session/${code}`);
    };

    if (!currentUser) {
      return (
        <div className="page">
          <h1 className="page-title">Loading...</h1>
          <p className="page-subtitle">Preparing your dashboard.</p>
        </div>
      );
    }

    return(
        <div className="page">
          <h1 className="page-title">Teacher Dashboard</h1>
          <h2 className="page-subtitle">Welcome, {currentUser?.name}</h2>

          <div className="stat-grid">
            <div className="stat-card">
              <p className="stat-label">Enrolled Students</p>
              <p className="stat-value">{enrolledParticipants}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Live Presence</p>
              <p className="stat-value">{liveParticipants}</p>
            </div>
          </div>


          <div className="panel stack">
            <h2 className="section-title">Create New Session</h2>
            <input type="text" placeholder="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={Boolean(titleError)} />
            {titleError && <p className="field-error">{titleError}</p>}
            {formMessage && <p className="field-success">{formMessage}</p>}
            <div className="cta-row">
              <button onClick={handleCreateSession} disabled={isCreating}>{isCreating ? "Creating..." : "Create Session"}</button>
              <button className="ghost-btn" onClick={() => navigate("/profile")}>View Profile</button>
            </div>
            
          </div>

          <div className="panel">
            <SessionHistory/>
          </div>
        </div>

    );
}
export default TeacherDashboard;