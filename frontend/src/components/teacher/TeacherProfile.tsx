import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TeacherProfile() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

    useEffect(() => {
        if (!currentUser || currentUser.role !== "teacher") {
            navigate("/login", { replace: true });
        }
    }, [currentUser, navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        navigate("/login", { replace: true });
    };

    if (!currentUser || currentUser.role !== "teacher") {
        return null;
    }

    return (
        <div className="page">
            <h1 className="page-title">Teacher Profile</h1>
            <div className="stack">
                <p>Name: {currentUser.name}</p>
                <p>Email: {currentUser.email}</p>
                <p>Role: {currentUser.role}</p>
            </div>
            <div className="cta-row" style={{ marginTop: "14px" }}>
                <button onClick={() => navigate("/teacher")}>Back to Dashboard</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default TeacherProfile;
