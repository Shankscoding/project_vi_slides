import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
interface User {
    name: string;
    email: string;
    password: string;   
    role: "student" | "teacher";
}
function Student_Details() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null") as User | null;
    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const totalEnrolledSessions = currentUser
        ? sessions.filter((session: any) => {
            const enrolledParticipants = Array.isArray(session.enrolledParticipants)
                ? session.enrolledParticipants
                : Array.isArray(session.participants)
                ? session.participants
                : [];
            return enrolledParticipants.includes(currentUser.email);
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
                
                <h2 className="panel-title">Notes</h2>

            </div>
            <button onClick={() => navigate("/profile")}>
                View Profile
            </button>
        </div>
    );
}
export default Student_Details;