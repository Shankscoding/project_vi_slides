import { Navigate } from "react-router-dom";
import StudentProfile from "./student/StudentProfile";
import TeacherProfile from "./teacher/TeacherProfile";
import { getCurrentUser } from "../lib/storage";

function Profile() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser.role === "teacher") {
        return <TeacherProfile />;
    }

    return <StudentProfile />;
}

export default Profile;
