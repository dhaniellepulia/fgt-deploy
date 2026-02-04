import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  //   const isAdmin = user.roleID && Number(user.roleID) === 1;
  const isAdmin =
    typeof user.email === "string" &&
    user.email.toLowerCase() === "admin@gmail.com";

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
