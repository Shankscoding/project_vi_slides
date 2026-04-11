import { Navigate } from "react-router-dom";
import StudentSession from "./StudentSession";
import TeacherSession from "./TeacherSession";  
import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";

function Room() {
    const { sessionId } = useParams();
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    const [session, setSession] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const isSameSession = (leftId: any, rightId: any) => String(leftId) === String(rightId);
    
    const updateQuestions = (updatedQuestions: any[]) => {
        setQuestions(updatedQuestions);
        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const updatedSessions = sessions.map((s: any) => {
            if(isSameSession(s.id, sessionId)) {
                return {...s, questions: updatedQuestions };
            }
            return s;
        });
        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        window.dispatchEvent(new Event("sessionsUpdated"));
    };

    if(!currentUser) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const loadSession = () => {
            const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
            const currentSession = sessions.find((s: any) => isSameSession(s.id, sessionId));
            if (currentSession) {
                setSession(currentSession);
                setQuestions(currentSession.questions || []);
            } else {
                setSession(null);
                setQuestions([]);
            }
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === "sessions") {
                loadSession();
            }
        };

        loadSession();
        window.addEventListener("sessionsUpdated", loadSession);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("sessionsUpdated", loadSession);
            window.removeEventListener("storage", handleStorage);
        };
    }, [sessionId]);

    if (!session) {
        return <div className="page">Session not found</div>;
    }
    return (
        <div className="page">
            <h1 className="page-title">Session Room: {session.title}</h1>
            <div className="stack">
                <p>Teacher: {session.teacher}</p>
                <p>Status: {session.status}</p>
            </div>
            {currentUser.role === "teacher" ?
             <TeacherSession session={session} questions={questions} setQuestions={updateQuestions} /> 
             :
              <StudentSession session={session} questions={questions} setQuestions={updateQuestions} />}
        </div>
    );
}
export default Room;

