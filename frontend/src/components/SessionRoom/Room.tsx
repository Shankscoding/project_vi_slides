import { Navigate, useNavigate } from "react-router-dom";
import StudentSession from "./StudentSession";
import TeacherSession from "./TeacherSession";  
import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";

function Room() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    const [session, setSession] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const isSameSession = (leftId: any, rightId: any) => String(leftId) === String(rightId);
    const updateLiveParticipants = (mode: "add" | "remove") => {
        if (!currentUser || currentUser.role !== "student" || !currentUser.email) {
            return;
        }

        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const updatedSessions = sessions.map((s: any) => {
            if (!isSameSession(s.id, sessionId)) {
                return s;
            }

            const currentLiveParticipants = Array.isArray(s.liveParticipants)
                ? s.liveParticipants
                : Array.isArray(s.participants)
                ? s.participants
                : [];
            const currentEnrolledParticipants = Array.isArray(s.enrolledParticipants)
                ? s.enrolledParticipants
                : [];
            let nextLiveParticipants = currentLiveParticipants;
            let nextEnrolledParticipants = currentEnrolledParticipants;

            if (mode === "add") {
                if (!currentLiveParticipants.includes(currentUser.email)) {
                    nextLiveParticipants = [...currentLiveParticipants, currentUser.email];
                }
                if (!currentEnrolledParticipants.includes(currentUser.email)) {
                    nextEnrolledParticipants = [...currentEnrolledParticipants, currentUser.email];
                }
            }

            if (mode === "remove") {
                nextLiveParticipants = currentLiveParticipants.filter((email: string) => email !== currentUser.email);
            }

            return {
                ...s,
                enrolledParticipants: nextEnrolledParticipants,
                liveParticipants: nextLiveParticipants
            };
        });

        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        window.dispatchEvent(new Event("sessionsUpdated"));
    };
    
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

    useEffect(() => {
        if (!session || currentUser.role !== "student" || session.status === "ended") {
            return;
        }

        updateLiveParticipants("add");

        const handleBeforeUnload = () => {
            updateLiveParticipants("remove");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updateLiveParticipants("remove");
        };
    }, [session?.id]);

    if (!session) {
        return <div className="page">Session not found</div>;
    }

    if (session.status === "ended" && currentUser.role === "student") {
        return (
            <div className="page">
                <h1 className="page-title">Session Ended</h1>
                <p className="page-subtitle">This session is no longer live.</p>
                <button onClick={() => navigate("/student")}>Back to Dashboard</button>
            </div>
        );
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

