import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import AppLayout from "./components/layouts/AppLayout.jsx";
import Dashboard from "./pages/UserDashboard.jsx";
import Projects from "./pages/Projects.jsx";
import Sessions from "./pages/Sessions.jsx";
import Store from "./pages/Store.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import GamerProfile from "./components/profile/GamerProfile.jsx";
import GameLibrary from "./components/profile/GameLibrary.jsx";
import RewardHistory from "./components/profile/RewardHistory.jsx";
import AccountSecurity from "./components/profile/AccountSecurity.jsx";
import OnboardingLayout from "./components/layouts/OnboardingLayout.jsx";
import WelcomeMessage from "./components/onboarding/WelcomeMessage.jsx";
import Questionnaire from "./components/onboarding/Questionnaire.jsx";
import AdditionalInformation from "./components/onboarding/AdditionalInformation.jsx";
import ExternalLayout from "./components/layouts/ExternalLayout.jsx";
import Faq from "./pages/FAQ.jsx";
import Contact from "./pages/Contact.jsx";
import PlayerTerms from "./pages/PlayerTerms.jsx";
import PrivacyPolicy from "./pages/PlayerPolicy.jsx";
// import Download from "./components/projects/Download.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import ProjectTest from "./pages/ProjectTest.jsx";
import ProjectSurvey from "./pages/ProjectSurvey.jsx";
import ImportantInformation from "./pages/ImportantInformation.jsx";
import Download from "./pages/Download.jsx";
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ExternalLayout />}>
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/playerterms" element={<PlayerTerms />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/importantinfo" element={<ImportantInformation />} />
        <Route path="/download" element={<Download />} />
      </Route>

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WelcomeMessage />} />
        <Route path="additional-info" element={<AdditionalInformation />} />
        <Route path="questionnaire" element={<Questionnaire />} />
      </Route>

      {/* Protected layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/projects" element={<Projects />}>
          <Route path="download" element={<Download />} />
        </Route> */}

        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/test" element={<ProjectTest />} />
        <Route path="/projects/:id/survey" element={<ProjectSurvey />} />
        {/* <Route path="/projects/:id/success" element={<ProjectSuccess />} /> */}

        <Route path="/sessions" element={<Sessions />} />
        <Route path="/store" element={<Store />} />
        <Route path="/profile" element={<Profile />}>
          <Route index element={<GamerProfile />} />
          <Route path="library" element={<GameLibrary />} />
          <Route path="rewards" element={<RewardHistory />} />
          <Route path="account" element={<AccountSecurity />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
