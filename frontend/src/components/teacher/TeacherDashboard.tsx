import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import SessionHistory from "./SessionHistory";

interface User {
    name: string;
    email: string;
    role: "student" | "teacher";
}

function TeacherDashboard() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [title, setTitle] = useState("");

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem("currentUser") || "null") as User | null;
        if (!user|| user.role !== "teacher") {
            navigate("/login");
        } else {
            setCurrentUser(user);
        }
    }, [navigate]);

    const generateCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const handleCreateSession = () => {
      if(!title) {
        alert("Please enter a title for the session");
        return;
      }

      const session=JSON.parse(localStorage.getItem("sessions") || "[]");

      let code:string;
      do {
        code = generateCode();
      } while (session.some((s: any) => s.id === code));

      const newSession = {
        id:code,
        title,
        teacher: currentUser?.name,
        teacherEmail: currentUser?.email,
        status:"live",
        createdAt: new Date().toISOString(),
        participants: []
      };
      session.push(newSession);
      localStorage.setItem("sessions", JSON.stringify(session));
      window.dispatchEvent(new Event("sessionsUpdated"));
      // alert(`Session created with code: ${code}`);
      setTitle("");


      navigate(`/session/${code}`);
    }



    return(
        <div className="page">
          <h1 className="page-title">Teacher Dashboard</h1>
          <h2 className="page-subtitle">Welcome, {currentUser?.name}</h2>

          <div className="panel stack">
            <input type="text" placeholder="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <button onClick={handleCreateSession}>Create Session</button>
            
          </div>

          <div className="panel">
            <SessionHistory/>
          </div>
        </div>

    );
}
export default TeacherDashboard;

//how to connect the student and the teacher
//when the teacher creates a session, we will generate a unique code for that session and store it in the local storage along with the teacher's email and name
//when the student enters the code, we will check if the code exists in the local storage and if it does, we will add the student's name and email to the participants array of that session and also we will store the current session in the session storage for the student to access it later
//we have to add the functionality for the teacher to end the session and also we have to update the status of the session in the local storage when the teacher ends the session
//we have to add the functionality for the teacher to view the questions asked by the students and also we have to add the functionality for the teacher to answer those questions and also we have to update the answers in the local storage so that the students can see the answers when they refresh the page