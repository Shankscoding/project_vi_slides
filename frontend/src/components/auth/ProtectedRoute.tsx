import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import type { Role } from "../../types/models";
import { getCurrentUser } from "../../lib/storage";

interface ProtectedRouteProps {
    children: ReactElement;
    allowedRoles?: Role[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const fallbackRoute = user.role === "teacher" ? "/teacher" : "/student";
        return <Navigate to={fallbackRoute} replace />;
    }

    return children;
}

export default ProtectedRoute;
