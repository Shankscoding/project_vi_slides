import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
    name: string;
    email: string;
    role: "student" | "teacher";
}

function StudentHistory() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        const loadSessions = () => {
            const user: User | null = JSON.parse(
                sessionStorage.getItem("currentUser") || "null"
            );

            if (!user || user.role !== "student") {
                navigate("/login", { replace: true });
                return;
            }

            const allSessions = JSON.parse(
                localStorage.getItem("sessions") || "[]"
            );

            const studentSessions = allSessions.filter((s: any) => {
                const enrolledParticipants = Array.isArray(s.enrolledParticipants)
                    ? s.enrolledParticipants
                    : Array.isArray(s.participants)
                    ? s.participants
                    : [];
                return enrolledParticipants.includes(user.email);
            });

            studentSessions.sort((a: any, b: any) => {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });

            setSessions(studentSessions);
        };

        loadSessions();

        const handleStorage = (event: StorageEvent) => {
            if (event.key === "sessions") {
                loadSessions();
            }
        };

        window.addEventListener("sessionsUpdated", loadSessions);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("sessionsUpdated", loadSessions);
            window.removeEventListener("storage", handleStorage);
        };
    }, [navigate]);

    return (
        <div className="stack">
            <h2 className="panel-title">Your Session History</h2>

            {sessions.length === 0 ? (
                <p className="muted">You have not joined any sessions yet.</p>
            ) : (
                <ul className="list">
                    {sessions.map((session) => (
                        <li className="list-item" key={session.id}>
                            <strong>{session.title}</strong>
                            <br />
                            Code: <b>{session.id}</b>
                            <br />
                            Teacher: {session.teacher}
                            <br />
                            Created on {new Date(session.createdAt).toLocaleString()}
                            <br />
                            Status: {session.status}
                            <br />
                            Live Joined: {Array.isArray(session.liveParticipants)
                                ? session.liveParticipants.length
                                : Array.isArray(session.participants)
                                ? session.participants.length
                                : 0}
                            <br />
                            <button
                                onClick={() => navigate(`/session/${session.id}`)}
                                disabled={session.status === "ended"}
                            >
                                {session.status === "ended" ? "Session Ended" : "Join Session"}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default StudentHistory;
