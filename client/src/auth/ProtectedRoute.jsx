// code to redirect new users to onboarding

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLocation } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const { user } = useAuth();

//   // not logged in
//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   // logged in BUT onboarding not completed
//   if (
//     !user.onboarding?.profileCompleted ||
//     !user.onboarding?.questionnaireCompleted
//   ) {
//     return <Navigate to="/onboarding" replace />;
//   }

//   return children;
// }

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const roleID = user.roleID?.toString();
  const isClient = roleID === "3" || roleID === "1";

  const localOnboarding = user.onboarding || {};
  const isOnboardingIncomplete = isClient
    ? !(user.onboardingClientCompleted || localOnboarding.clientCompleted)
    : !(
        (user.onboardingProfileCompleted || localOnboarding.profileCompleted) &&
        (user.onboardingQuestionnaireCompleted ||
          localOnboarding.questionnaireCompleted)
      );

  const isCurrentlyOnboarding = location.pathname.startsWith("/onboarding");
  const isClientOnboarding = location.pathname.startsWith("/onboarding/client");
  const isPlaytesterOnboarding =
    isCurrentlyOnboarding && !isClientOnboarding;

  if (isClient && isPlaytesterOnboarding) {
    return <Navigate to="/onboarding/client" replace />;
  }

  if (!isClient && isClientOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboardingIncomplete && !isCurrentlyOnboarding) {
    return <Navigate to={isClient ? "/onboarding/client" : "/onboarding"} replace />;
  }

  if (!isOnboardingIncomplete && isCurrentlyOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
