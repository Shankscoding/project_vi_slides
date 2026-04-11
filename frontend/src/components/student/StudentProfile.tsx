import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function StudentProfile() {
    const navigate = useNavigate();
    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        navigate('/login');
    }
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [navigate, currentUser]);
    if (!currentUser) {
        return null; // or a loading spinner
    }
    return (
        <div className="page">
            <h1 className="page-title">Student Profile</h1>
            <div className="stack">
                <p>Name: {currentUser.name}</p>
                <p>Email: {currentUser.email}</p>
                <p>Role: {currentUser.role}</p>
            </div>
            <div className="cta-row" style={{ marginTop: "14px" }}>
                <button>Update Profile</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}export default StudentProfile;