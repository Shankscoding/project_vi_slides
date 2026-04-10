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
    
    if(!currentUser) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const foundSession = sessions.find((s: any) => s.id === sessionId);

        if(foundSession) {
            setSession(foundSession);
            setQuestions(foundSession.questions || []);
        }
    }, [sessionId]);

    if (!session) {
        return <div>Session not found</div>;
    }
    return (
        <div>
            <h1>Session Room: {session.title}</h1>
            <p>Teacher: {session.teacher}</p>
            <p>Status: {session.status}</p>
            {currentUser.role === "teacher" ?
             <TeacherSession session={session} questions={questions} setQuestions={setQuestions} /> 
             :
              <StudentSession session={session} questions={questions} setQuestions={setQuestions} />}
        </div>
    );
}
export default Room;

