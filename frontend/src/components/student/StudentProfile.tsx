import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getCurrentUser } from "../../lib/storage";

function StudentProfile() {
    const navigate = useNavigate();
    const handleLogout = () => {
        clearAuthSession();
        navigate('/login');
    };
    const currentUser = getCurrentUser();
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [navigate, currentUser]);
    if (!currentUser) {
        return null;
    }
    return (
        <div className="page">
            <h1 className="page-title">Student Profile</h1>
            <div className="panel">
                <div className="meta-grid">
                    <p>Name: <b>{currentUser.name}</b></p>
                    <p>Email: <b>{currentUser.email}</b></p>
                    <p>Role: <span className="pill">{currentUser.role}</span></p>
                </div>
            </div>
            <div className="cta-row" style={{ marginTop: "14px" }}>
                <button className="ghost-btn" onClick={() => navigate("/student")}>Back to Dashboard</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default StudentProfile;