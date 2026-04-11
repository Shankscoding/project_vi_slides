import { Navigate } from "react-router-dom";
import StudentProfile from "./student/StudentProfile";
import TeacherProfile from "./teacher/TeacherProfile";

function Profile() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser.role === "teacher") {
        return <TeacherProfile />;
    }

    return <StudentProfile />;
}

export default Profile;
