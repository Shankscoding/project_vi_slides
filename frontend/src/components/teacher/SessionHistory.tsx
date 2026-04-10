import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

interface User {
    name: string;
    email: string;
    role: "student" | "teacher";
}

function SessionHistory() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null") as User | null;
    useEffect(() => {
        if (!currentUser|| currentUser.role !== "teacher") {
            navigate('/login');
        } 
        else {
            const allSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
            const teacherSessions = allSessions.filter((s: any) => s.teacherEmail === currentUser.email);
            setSessions(teacherSessions);
        }
    }, [navigate, currentUser]);

    return (
        <div>
            <h2>Session History</h2>
            {sessions.length === 0 ? (
                <p>No sessions created yet.</p>
            ) : (
                <ul>
                    {sessions.map((session) => (
                        <li key={session.id}>
                            <h3>{session.title}</h3>    
                            <p>Code: {session.id}</p>
                            <p>Status: {session.status}</p>
                            <p>Created At: {new Date(session.createdAt).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default SessionHistory;