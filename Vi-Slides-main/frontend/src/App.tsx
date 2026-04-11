import { BrowserRouter,Routes,Route } from "react-router-dom";
import {lazy,Suspense} from "react";
//import StudentProfile from "./components/Profile/StudentProfile";
const Home=lazy(()=>import("./components/Home"));
const Login=lazy(()=>import("./components/Login"));
const StudentLogin=lazy(()=>import("./components/StudentLogin"));
const TeacherLogin=lazy(()=>import("./components/TeacherLogin"));
const SignUp=lazy(()=>import("./components/SignUp"));
const StudentDashboard=lazy(()=>import("./components/student/StudentDashboard"));
const TeacherDashboard=lazy(()=>import("./components/teacher/TeacherDashboard"));
const Room = lazy(() => import("./components/SessionRoom/Room"));
const StudentProfile = lazy(() => import("./components/Profile/StudentProfile"));
const TeacherProfile = lazy(() => import("./components/Profile/TeacherProfile"));
//later we have to add auth and role based routing
//later we have to prevent the direct access to the dashboard without login and also based on role
//we have to add a common layout for both student and teacher dashboard with sidebar and header


function App(){
  return (
    <BrowserRouter>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          <Route path="/session/:sessionId" element={<Room />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
export default App;