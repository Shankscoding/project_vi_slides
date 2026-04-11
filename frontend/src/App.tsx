import {Routes,Route } from "react-router-dom";
import {lazy,Suspense} from "react";

//lazy loading the components
const Home=lazy(()=>import("./components/Home"));
const Login=lazy(()=>import("./components/Login"));
const SignUp=lazy(()=>import("./components/SignUp"));
const StudentDashboard=lazy(()=>import("./components/student/StudentDashboard"));
const TeacherDashboard=lazy(()=>import("./components/teacher/TeacherDashboard"));
const StudentProfile=lazy(()=>import("./components/student/StudentProfile"));
const Room=lazy(()=>import("./components/SessionRoom/Room"));
const Chat = lazy(() => import("./components/chat"));


//later we have to add auth and role based routing
//later we have to prevent the direct access to the dashboard without login and also based on role
//we have to add a common layout for both student and teacher dashboard with sidebar and header


function App(){
  return (
    
      <Suspense fallback={<h1>Loading...</h1>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/session/:sessionId" element={<Room />} />
          <Route path="/chat" element={<Chat />} />

        </Routes>
      </Suspense>

  )
}
export default App;