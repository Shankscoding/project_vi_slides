import { useNavigate } from 'react-router-dom';
interface User {
    name: string;
    email: string;
    password: string;   
    role: "student" | "teacher";
}
function Student_Details() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null") as User | null;
    if (!currentUser) {
        navigate('/login');
        return null; // or a loading spinner
    }
    return (
        <div className="stack">
            <div className="stack">
                

                <h2 className="panel-title">Total Enrolled Sessions: 5</h2>
                
                <h2 className="panel-title">Notes</h2>

            </div>
            <button onClick={() => navigate("/Profile")}>
                View Profile
            </button>
        </div>
    );
}
export default Student_Details;