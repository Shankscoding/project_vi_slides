import { useNavigate } from 'react-router-dom';
interface User {
    name: string;
    email: string;
    password: string;   
    role: "student" | "teacher";
}
function Student_Details() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as User | null;
    if (!currentUser) {
        navigate('/login');
        return null; // or a loading spinner
    }
    return (
        <div>
            <h1>Welcome, {currentUser.name}!</h1>
            <button onClick={()=>navigate('./StudentProfile')}>View Profile</button>
        </div>
    );
}
export default Student_Details;