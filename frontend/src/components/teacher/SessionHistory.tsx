import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser, getSessions } from "../../lib/storage";
import type { SessionRecord, User } from "../../types/models";

function SessionHistory() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "live" | "paused" | "ended">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const hasLoadedOnce = useRef(false);

    useEffect(() => {
        const loadSessions = () => {
            if (!hasLoadedOnce.current) {
                setIsLoading(true);
            }
            setErrorMessage("");
            const user: User | null = getCurrentUser();

            if (!user || user.role !== "teacher") {
                setErrorMessage("Unable to load teacher session history.");
                setIsLoading(false);
                return;
            }

            const allSessions = getSessions();

            const teacherSessions = allSessions.filter(
                (s) => s.teacherEmail === user.email
            );

            teacherSessions.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setSessions(teacherSessions);
            setIsLoading(false);
            hasLoadedOnce.current = true;
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

    const filteredSessions = sessions.filter((session) => {
        const queryText = query.trim().toLowerCase();
        const matchesQuery =
            !queryText ||
            session.title.toLowerCase().includes(queryText) ||
            session.id.toLowerCase().includes(queryText);
        const matchesStatus = statusFilter === "all" || session.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const pagedSessions = filteredSessions.slice(pageStart, pageStart + pageSize);

    const goToPrevious = () => setCurrentPage((page) => Math.max(1, page - 1));
    const goToNext = () => setCurrentPage((page) => Math.min(totalPages, page + 1));

    return (
        <div className="stack">
            <h2 className="panel-title">Your Session History</h2>

            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search by title or code"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as "all" | "live" | "paused" | "ended");
                        setCurrentPage(1);
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="live">Live</option>
                    <option value="paused">Paused</option>
                    <option value="ended">Ended</option>
                </select>
            </div>

            {isLoading && <p className="muted">Loading session history...</p>}
            {!isLoading && errorMessage && <p className="field-error">{errorMessage}</p>}

            {!isLoading && !errorMessage && sessions.length === 0 ? (
                <p className="muted">You have not created any sessions yet.</p>
            ) : null}

            {!isLoading && !errorMessage && sessions.length > 0 && filteredSessions.length === 0 ? (
                <p className="muted">No sessions match your current filters.</p>
            ) : (
                <ul className="list">
                    {pagedSessions.map((session) => (
                        <li className="list-item" key={session.id}>
                            <strong>{session.title}</strong>
                            <div className="meta-grid">
                                <p>Code: <b>{session.id}</b></p>
                                <p>Status: <span className={`status-chip status-${session.status}`}>{session.status}</span></p>
                                <p>Enrolled: <b>{session.enrolledParticipants.length}</b></p>
                                <p>Live: <b>{session.liveParticipants.length}</b></p>
                                <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="cta-row">
                                <button
                                    onClick={() =>
                                        navigate(`/session/${session.id}`)
                                    }
                                    disabled={session.status === "ended"}
                                >
                                    {session.status === "ended" ? "Session Ended" : "Join Session"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && !errorMessage && filteredSessions.length > 0 && (
                <div className="pagination-row">
                    <button onClick={goToPrevious} disabled={safePage === 1}>Previous</button>
                    <p className="muted">Page {safePage} of {totalPages}</p>
                    <button onClick={goToNext} disabled={safePage === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
}

export default SessionHistory;