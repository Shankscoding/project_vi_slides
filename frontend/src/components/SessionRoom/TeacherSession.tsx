import { Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getSessions, setSessions } from "../../lib/storage";
import type { SessionQuestion, SessionRecord } from "../../types/models";

interface TeacherSessionProps {
    session: SessionRecord;
    questions: SessionQuestion[];
    setQuestions: (updatedQuestions: SessionQuestion[]) => void;
}

function TeacherSession({ session, questions, setQuestions }: TeacherSessionProps) {
    const currentUser = getCurrentUser();
    const navigate = useNavigate();
    if (!currentUser || currentUser.role !== "teacher") {
        return <Navigate to="/login" />;
    }


    const totalEnrolledParticipants = session.enrolledParticipants.length;
    const liveJoinedParticipants = session.liveParticipants.length;

    const [reply, setReply] = useState<{[key: number]: string}>({});
    const [replyError, setReplyError] = useState("");
    const [viewMode, setViewMode] = useState<"slides" | "list">("slides");
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    const sortedQuestions = useMemo(() => {
        return [...questions].sort((a, b) => a.id - b.id);
    }, [questions]);

    const activeQuestion = sortedQuestions[activeSlideIndex] || null;

    useEffect(() => {
        if (activeSlideIndex > sortedQuestions.length - 1) {
            setActiveSlideIndex(Math.max(0, sortedQuestions.length - 1));
        }
    }, [activeSlideIndex, sortedQuestions.length]);

    const updateSessionStatus = (nextStatus: "live" | "paused" | "ended") => {
        const sessions = getSessions();
        const updatedSessions = sessions.map((s) => {
            if (String(s.id) !== String(session.id)) {
                return s;
            }

            return {
                ...s,
                status: nextStatus,
                endedAt: nextStatus === "ended" ? new Date().toISOString() : s.endedAt,
                liveParticipants: nextStatus === "ended" ? [] : s.liveParticipants
            };
        });

        setSessions(updatedSessions);
    };

    const handleEndSession = () => {
        updateSessionStatus("ended");
        navigate(`/session/${session.id}/summary`);
    };

    const handlePauseSession = () => {
        updateSessionStatus("paused");
    };

    const handleStartSession = () => {
        updateSessionStatus("live");
    };

    const handleBackToDashboard = () => {
        navigate("/teacher");
    };

    const handleReply = (id:number) => {
        setReplyError("");
        if(!reply[id]?.trim()) {
            setReplyError("Answer cannot be empty.");
            return;
        }
        const updatedQuestions = questions.map((q) => {
            if(q.id === id) {
                return { ...q, answers: [...(q.answers || []), reply[id].trim()] };
            }
            return q;
        });

        setQuestions(updatedQuestions);
        setReply((prev) => ({ ...prev, [id]: "" }));
    };

    const goToPreviousSlide = () => {
        setActiveSlideIndex((index) => Math.max(0, index - 1));
    };

    const goToNextSlide = () => {
        setActiveSlideIndex((index) => Math.min(sortedQuestions.length - 1, index + 1));
    };

    const hour = new Date().getHours();

    return (
        <div className="panel stack">
            <h2>Good {hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening"}, {currentUser.name}</h2>
            <h2>Teacher Session</h2>
            <p className="pill">Room ID: {session.id}</p>
            <p className="pill">Status: {session.status}</p>
            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Total Enrolled</p>
                    <p className="stat-value">{totalEnrolledParticipants}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Live Joined</p>
                    <p className="stat-value">{liveJoinedParticipants}</p>
                </div>
            </div>
            <div className="cta-row">
                {session.status === "paused" ? (
                    <button onClick={handleStartSession}>Start Session</button>
                ) : (
                    <button onClick={handlePauseSession}>Pause Session</button>
                )}
                <button onClick={handleEndSession}>End Session</button>
                <button className="ghost-btn" onClick={handleBackToDashboard}>Back to Dashboard</button>
            </div>

            <div className="cta-row">
                <button className={viewMode === "slides" ? "" : "ghost-btn"} onClick={() => setViewMode("slides")}>Slides View</button>
                <button className={viewMode === "list" ? "" : "ghost-btn"} onClick={() => setViewMode("list")}>List View</button>
            </div>

            <h3>Questions</h3>
            {replyError && <p className="field-error">{replyError}</p>}

            {sortedQuestions.length === 0 ? (
                <p className="muted">No questions submitted yet.</p>
            ) : viewMode === "slides" && activeQuestion ? (
                <div className="list-item">
                    <p className="pill">Slide {activeSlideIndex + 1} of {sortedQuestions.length}</p>
                    <p style={{ marginTop: "8px" }}><b>{activeQuestion.text}</b></p>
                    <p>asked by <i>{activeQuestion.askedBy}</i></p>
                    {activeQuestion.answers.length > 0 && (
                        <div className="panel" style={{ marginTop: "10px" }}>
                            <b>Answers:</b>
                            {activeQuestion.answers.map((answer, index) => (
                                <p key={index}>{answer}</p>
                            ))}
                        </div>
                    )}
                    <div className="stack" style={{ marginTop: "10px" }}>
                        <input
                            type="text"
                            value={reply[activeQuestion.id] || ""}
                            onChange={(e) => setReply((prev) => ({ ...prev, [activeQuestion.id]: e.target.value }))}
                            placeholder="Type your answer..."
                            aria-label="Teacher answer input"
                        />
                        <div className="cta-row">
                            <button onClick={() => handleReply(activeQuestion.id)} disabled={!reply[activeQuestion.id]?.trim()}>Reply</button>
                            <button className="ghost-btn" onClick={goToPreviousSlide} disabled={activeSlideIndex === 0}>Previous</button>
                            <button className="ghost-btn" onClick={goToNextSlide} disabled={activeSlideIndex >= sortedQuestions.length - 1}>Next</button>
                        </div>
                    </div>
                </div>
            ) : (
                <ul className="list">
                    {sortedQuestions.map((q) => (
                        <li className="list-item" key={q.id}>
                            <p><b>{q.text}</b> - <i>asked by {q.askedBy}</i></p>
                            {q.answers.length > 0 && (
                                <div className="panel" style={{ marginTop: "8px" }}>
                                    <b>Answers:</b>
                                    {q.answers.map((answer, index) => (
                                        <p key={index}>{answer}</p>
                                    ))}
                                </div>
                            )}
                            <div className="stack" style={{ marginTop: "8px" }}>
                                <input
                                    type="text"
                                    value={reply[q.id] || ""}
                                    onChange={(e) => setReply((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                    placeholder="Type your answer..."
                                    aria-label={`Answer input for question ${q.id}`}
                                />
                                <button onClick={() => handleReply(q.id)} disabled={!reply[q.id]?.trim()}>Reply</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default TeacherSession;