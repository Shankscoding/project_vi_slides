import {Routes,Route } from "react-router-dom";
import {lazy,Suspense, useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import { ApiError, me } from "./lib/authApi";
import { clearAuthSession, getAuthToken, setAuthSession } from "./lib/storage";

const Home=lazy(()=>import("./components/Home"));
const Login=lazy(()=>import("./components/Login"));
const SignUp=lazy(()=>import("./components/SignUp"));
const StudentDashboard=lazy(()=>import("./components/student/StudentDashboard"));
const TeacherDashboard=lazy(()=>import("./components/teacher/TeacherDashboard"));
const Profile=lazy(()=>import("./components/Profile"));
const Room=lazy(()=>import("./components/SessionRoom/Room"));
const SessionSummary=lazy(async()=>({ default: (await import("./components/SessionRoom")).SessionSummary }));


function App(){
  const location = useLocation();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      const token = getAuthToken();

      if (!token) {
        if (isActive) {
          setIsAuthReady(true);
        }
        return;
      }

      try {
        const user = await me(token);
        if (isActive) {
          setAuthSession({ user, token });
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
        }
      } finally {
        if (isActive) {
          setIsAuthReady(true);
        }
      }
    };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (!isAuthReady) {
    return <div className="page"><h1 className="page-title">Loading...</h1><p className="page-subtitle">Preparing authentication.</p></div>;
  }

  return (
      <Suspense fallback={<div className="page"><h1 className="page-title">Loading...</h1><p className="page-subtitle">Preparing the workspace.</p></div>}>
        <div className="route-shell" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
            <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/session/:sessionId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
            <Route path="/session/:sessionId/summary" element={<ProtectedRoute allowedRoles={["teacher"]}><SessionSummary /></ProtectedRoute>} />
          </Routes>
        </div>
      </Suspense>

  )
}
export default App;