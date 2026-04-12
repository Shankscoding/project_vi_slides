import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getCurrentUser } from "../../lib/storage";

interface PublicOnlyRouteProps {
    children: ReactElement;
}

function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
    const user = getCurrentUser();

    if (!user) {
        return children;
    }

    const dashboardRoute = user.role === "teacher" ? "/teacher" : "/student";
    return <Navigate to={dashboardRoute} replace />;
}

export default PublicOnlyRoute;
