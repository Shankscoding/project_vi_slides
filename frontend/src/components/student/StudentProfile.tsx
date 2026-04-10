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
        <div>
            <h1>Student Profile</h1>
            <p>Name: {currentUser.name}</p>
            <p>Email: {currentUser.email}</p>
            <p>Role: {currentUser.role}</p>
            <div>
                <button>Update Profile</button>
            </div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}export default StudentProfile;