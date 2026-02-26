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

  const isAdmin = user.roleID && Number(user.roleID) === 1;
  if (isAdmin) return children;

  const roleID = user.roleID?.toString();
  const isClient = roleID === "3" || roleID === "1";

  const localOnboarding = user.onboarding || {};
  const hasProfileCompleted = Boolean(
    user.onboardingProfileCompleted || localOnboarding.profileCompleted,
  );
  const hasQuestionnaireCompleted = Boolean(
    user.onboardingQuestionnaireCompleted ||
      localOnboarding.questionnaireCompleted,
  );
  const isOnboardingIncomplete = isClient
    ? !(user.onboardingClientCompleted || localOnboarding.clientCompleted)
    : !(hasProfileCompleted && hasQuestionnaireCompleted);

  const isCurrentlyOnboarding = location.pathname.startsWith("/onboarding");
  const isClientOnboarding = location.pathname.startsWith("/onboarding/client");
  const isPlaytesterOnboarding = isCurrentlyOnboarding && !isClientOnboarding;

  if (isClient && isPlaytesterOnboarding) {
    return <Navigate to="/onboarding/client" replace />;
  }

  if (!isClient && isClientOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!isClient && isPlaytesterOnboarding) {
    if (hasProfileCompleted && !hasQuestionnaireCompleted) {
      if (location.pathname !== "/onboarding/questionnaire") {
        return <Navigate to="/onboarding/questionnaire" replace />;
      }
    } else if (!hasProfileCompleted) {
      if (location.pathname === "/onboarding/questionnaire") {
        return <Navigate to="/onboarding/additional-info" replace />;
      }
    }
  }

  if (isOnboardingIncomplete && !isCurrentlyOnboarding) {
    return (
      <Navigate
        to={
          isClient
            ? "/onboarding/client"
            : hasProfileCompleted && !hasQuestionnaireCompleted
              ? "/onboarding/questionnaire"
              : "/onboarding"
        }
        replace
      />
    );
  }

  if (!isOnboardingIncomplete && isCurrentlyOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
