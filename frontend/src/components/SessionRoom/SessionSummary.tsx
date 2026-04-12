import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCurrentUser, getSessions } from "../../lib/storage";

function SessionSummary() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "teacher") {
        return <Navigate to="/login" replace />;
    }

    const session = getSessions().find((item) => String(item.id) === String(sessionId));

    if (!session) {
        return (
            <div className="page">
                <h1 className="page-title">Summary Not Found</h1>
                <p className="page-subtitle">The session record could not be loaded.</p>
                <button onClick={() => navigate("/teacher")}>Back to Dashboard</button>
            </div>
        );
    }

    const startedTime = new Date(session.createdAt).getTime();
    const endedTime = new Date(session.endedAt || Date.now()).getTime();
    const durationMinutes = Math.max(1, Math.round((endedTime - startedTime) / 60000));
    const totalQuestions = session.questions?.length || 0;

    const moodGist =
        totalQuestions === 0
            ? "Quiet session with low question activity."
            : totalQuestions <= 4
            ? "Focused session with selective and practical questions."
            : "Highly engaged session with strong curiosity and active participation.";

    return (
        <div className="page">
            <h1 className="page-title">Session Summary</h1>
            <p className="page-subtitle">A quick reflection view to support post-class review.</p>

            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Session Code</p>
                    <p className="stat-value">{session.id}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Duration</p>
                    <p className="stat-value">{durationMinutes} min</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Total Questions</p>
                    <p className="stat-value">{totalQuestions}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Status</p>
                    <p className="stat-value">{session.status}</p>
                </div>
            </div>

            <div className="panel stack">
                <h2 className="section-title">Class Mood Gist</h2>
                <p>{moodGist}</p>
            </div>

            <div className="cta-row" style={{ marginTop: "14px" }}>
                <button className="ghost-btn" onClick={() => navigate(`/session/${session.id}`)}>
                    Reopen Session Room
                </button>
                <button onClick={() => navigate("/teacher")}>Back to Dashboard</button>
            </div>
        </div>
    );
}

export default SessionSummary;
