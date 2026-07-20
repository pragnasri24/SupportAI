import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type ProtectedRouteProps = {
  children: ReactElement;
  allowedRoles?: UserRole[];
};

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("supportai_token");
  const storedUser = localStorage.getItem("supportai_user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user: StoredUser;

  try {
    user = JSON.parse(storedUser) as StoredUser;
  } catch {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_user");

    return <Navigate to="/login" replace />;
  }

  if (!user.id || !user.email || !user.role) {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_user");

    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (
      user.role === "AGENT" ||
      user.role === "ADMIN"
    ) {
      return (
        <Navigate
          to="/agent/dashboard"
          replace
        />
      );
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;