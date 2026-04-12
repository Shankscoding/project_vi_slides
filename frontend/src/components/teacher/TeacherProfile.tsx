import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearCurrentUser, getCurrentUser } from "../../lib/storage";

function TeacherProfile() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    useEffect(() => {
        if (!currentUser || currentUser.role !== "teacher") {
            navigate("/login", { replace: true });
        }
    }, [currentUser, navigate]);

    const handleLogout = () => {
        clearCurrentUser();
        navigate("/login", { replace: true });
    };

    if (!currentUser || currentUser.role !== "teacher") {
        return null;
    }

    return (
        <div className="page">
            <h1 className="page-title">Teacher Profile</h1>
            <div className="panel">
                <div className="meta-grid">
                    <p>Name: <b>{currentUser.name}</b></p>
                    <p>Email: <b>{currentUser.email}</b></p>
                    <p>Role: <span className="pill">{currentUser.role}</span></p>
                </div>
            </div>
            <div className="cta-row" style={{ marginTop: "14px" }}>
                <button className="ghost-btn" onClick={() => navigate("/teacher")}>Back to Dashboard</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default TeacherProfile;
