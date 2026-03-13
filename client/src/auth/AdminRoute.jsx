import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  const roleID = Number(user.roleID);
  const isAdmin = roleID === 1;
  if (!isAdmin) {
    const fallbackPath = roleID === 3 ? "/projects" : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
