import { Navigate, useNavigate } from "react-router-dom";
import StudentSession from "./StudentSession";
import TeacherSession from "./TeacherSession";  
import { useParams } from "react-router-dom";
import { useState,useEffect, useRef } from "react";
import { getCurrentUser, getSessions, setSessions } from "../../lib/storage";
import type { SessionQuestion, SessionRecord } from "../../types/models";

function Room() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const [session, setSession] = useState<SessionRecord | null>(null);
    const [questions, setQuestions] = useState<SessionQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedOnce = useRef(false);
    const isSameSession = (leftId: string, rightId: string | undefined) => String(leftId) === String(rightId);
    const updateLiveParticipants = (mode: "add" | "remove") => {
        if (!currentUser || currentUser.role !== "student" || !currentUser.email) {
            return;
        }

        const sessions = getSessions();
        const updatedSessions = sessions.map((s) => {
            if (!isSameSession(s.id, sessionId)) {
                return s;
            }

            const currentLiveParticipants = s.liveParticipants;
            const currentEnrolledParticipants = s.enrolledParticipants;
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

        setSessions(updatedSessions);
    };
    
    const updateQuestions = (updatedQuestions: SessionQuestion[]) => {
        setQuestions(updatedQuestions);
        const sessions = getSessions();
        const updatedSessions = sessions.map((s) => {
            if(isSameSession(s.id, sessionId)) {
                return {...s, questions: updatedQuestions };
            }
            return s;
        });
        setSessions(updatedSessions);
    };

    if(!currentUser) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const loadSession = () => {
            if (!hasLoadedOnce.current) {
                setIsLoading(true);
            }
            const sessions = getSessions();
            const currentSession = sessions.find((s) => isSameSession(s.id, sessionId));
            if (currentSession) {
                setSession(currentSession);
                setQuestions(currentSession.questions || []);
            } else {
                setSession(null);
                setQuestions([]);
            }
            setIsLoading(false);
            hasLoadedOnce.current = true;
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
        if (!session || !currentUser || currentUser.role !== "student" || session.status === "ended") {
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
        if (isLoading) {
            return (
                <div className="page">
                    <h1 className="page-title">Loading Session...</h1>
                    <p className="page-subtitle">Fetching current room details.</p>
                </div>
            );
        }
        return <div className="page">Session not found</div>;
    }

    if (session.status === "ended" && currentUser?.role === "student") {
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
            <div className="panel">
                <div className="meta-grid">
                    <p>Teacher: <b>{session.teacher}</b></p>
                    <p>Status: <span className={`status-chip status-${session.status}`}>{session.status}</span></p>
                    <p>Session Code: <b>{session.id}</b></p>
                </div>
            </div>
            {currentUser.role === "teacher" ?
             <TeacherSession session={session} questions={questions} setQuestions={updateQuestions} /> 
             :
              <StudentSession session={session} questions={questions} setQuestions={updateQuestions} />}
        </div>
    );
}
export default Room;

