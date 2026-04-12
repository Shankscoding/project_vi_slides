import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentUser, getSessions } from '../../lib/storage';

function Student_Details() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const sessions = getSessions();
    const totalEnrolledSessions = currentUser
        ? sessions.filter((session) => {
            return session.enrolledParticipants.includes(currentUser.email);
        }).length
        : 0;
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    if (!currentUser) {
        return null;
    }
    return (
        <div className="stack">
            <div className="stack">
                <h2 className="panel-title">Total Enrolled Sessions: {totalEnrolledSessions}</h2>
                <p className="pill">Progress Overview</p>
                <p className="muted">You can rejoin active sessions anytime from your history section below.</p>

            </div>
            <button className="ghost-btn" onClick={() => navigate("/profile")}>
                View Profile
            </button>
        </div>
    );
}
export default Student_Details;