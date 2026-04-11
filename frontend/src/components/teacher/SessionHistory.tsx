import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface User {
    name: string;
    email: string;
    role: "student" | "teacher";
}

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function SessionHistory() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        const loadSessions = () => {
            const user: User | null = JSON.parse(
                sessionStorage.getItem("currentUser") || "null"
            );

            if (!user || user.role !== "teacher") {
                navigate("/login", { replace: true });
                return;
            }

            const allSessions = JSON.parse(
                localStorage.getItem("sessions") || "[]"
            );

            const teacherSessions = allSessions.filter(
                (s: any) => s.teacherEmail === user.email
            );

            setSessions(teacherSessions);
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

    const createNewSession = () => {
        const user: User | null = JSON.parse(
            sessionStorage.getItem("currentUser") || "null"
        );

        if (!user || user.role !== "teacher") {
            alert("Only teachers can create sessions");
            return;
        }

        const allSessions = JSON.parse(
            localStorage.getItem("sessions") || "[]"
        );

        const newSession = {
            id: generateCode(),
            title: `Session ${allSessions.length + 1}`,
            teacherEmail: user.email, // ✅ FIXED
            status: "live",
            createdAt: new Date().toISOString(),
            participants: []
        };

        allSessions.push(newSession);

        localStorage.setItem("sessions", JSON.stringify(allSessions));

        window.dispatchEvent(new Event("sessionsUpdated"));

        navigate(`/session/${newSession.id}`);
    };

    return (
        <div className="stack">
            <h2 className="panel-title">Your Session History</h2>

            <button onClick={createNewSession}>
                + Create New Session
            </button>

            {sessions.length === 0 ? (
                <p className="muted">You have not created any sessions yet.</p>
            ) : (
                <ul className="list">
                    {sessions.map((session) => (
                        <li className="list-item" key={session.id}>
                            <strong>{session.title}</strong>
                            <br />
                            Code: <b>{session.id}</b>
                            <br />
                            Created on{" "}
                            {new Date(session.createdAt).toLocaleString()}
                            <br />
                            Status: {session.status}
                            <br />

                            <button
                                onClick={() =>
                                    navigate(`/session/${session.id}`)
                                }
                            >
                                Join Session
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SessionHistory;