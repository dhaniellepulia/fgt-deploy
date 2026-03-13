//Login Page
import React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import OverlayModal from "../components/OverlayModal";
import { Mail, Phone } from "lucide-react";
import GradientBg from "../assets/gradient.png";
import Asset3D1 from "../assets/3D asset 1.png";
import LogoPNE from "../assets/logo PNE.png";

function Login() {
  const { user, token, loading, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Login Failed");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openErrorModal = (title, message) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorOpen(true);
  };

  useEffect(() => {
    if (loading) return;
    if (!token) {
      if (user && Number(user.userStatusID) === 4) {
        navigate("/pending", { replace: true });
      }
      return;
    }
    if (!user) return;

    const roleID = Number(user.roleID);
    if (roleID === 1) {
      navigate("/admin/accounts", { replace: true });
      return;
    }
    if (roleID === 3) {
      navigate("/projects", { replace: true });
      return;
    }
    navigate("/dashboard", { replace: true });
  }, [loading, navigate, token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const res = await login({ email: username, password });
      if (res?.user && Number(res.user.roleID) === 1) {
        navigate("/admin/accounts");
      } else if (res?.user && Number(res.user.roleID) === 3) {
        // navigate("/dashboard");
        navigate("/projects");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err?.message;
      if (msg === "Account pending" || msg === "Account not active") {
        navigate("/pending");
        return;
      }
      if (msg === "Account disapproved") {
        openErrorModal(
          "Account Disapproved",
          "Your account was disapproved. Contact support.",
        );
        return;
      }
      if (msg === "Invalid credentials") {
        openErrorModal(
          "Login Failed",
          "Invalid email or password. Please try again.",
        );
        return;
      }
      openErrorModal(
        "Login Failed",
        "Unable to log in right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const { t } = useTranslation();

  return (
    <div className="min-h-screen h-full bg-[#201e26] w-full overflow-hidden">
      <nav className="relative top-0 z-50 h-17.5">
        <div className="max-w-[1640px] h-full mx-auto px-4 py-4 flex justify-end">
          <div className=" space-x-4">
            <button
              onClick={() => navigate("/contact")}
              className="bg-white text-black px-4 py-1 rounded-sm font-bold"
            >
              {t("button_contact")}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </nav>

      <main className="h-full lg:h-[calc(100vh-70px)] flex lg:flex-row flex-col-reverse max-w-[1640px] mx-auto relative lg:static">
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <img
            className="max-w-150 lg:max-w-225 h-auto"
            src={GradientBg}
            alt="gradient"
          />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <img className="w-full h-auto" src={Asset3D1} alt="signup picture" />
        </div>
        {/* Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-1">
          <div className="w-full p-8">
            <div className="mb-5 w-full">
              <img
                className="w-full h-auto max-w-32"
                src={LogoPNE}
                alt="logo"
              />
            </div>
            <h2 className="text-5xl font-semibold  mb-4">
              {t("login.main_title")}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg font-medium ">
                  {t("login.label_username")}
                </label>
                <input
                  type="input"
                  required
                  disabled={submitting}
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-medium ">
                  {t("login.label_password")}
                </label>
                <input
                  type="password"
                  required
                  disabled={submitting}
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="ml-2 text-white">
                    {t("login.label_keep_me_logged_in")}
                  </span>
                </label>
                <a href="#" className="text-sm text-white hover:underline">
                  {t("login.label_forgot_password")}
                </a>
              </div>

              <button
                disabled={submitting}
                className="w-full py-3 px-4 bg-linear-to-tr from-[#4184e8] to-[#284cc4] text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Signing in..." : t("login.button_signin")}
              </button>
            </form>

            <div className="flex items-center my-6 text-white text-md">
              <div className="flex-grow border-t border-white"></div>
              <span className="px-3 whitespace-nowrap">
                {t("login.label_continue_with")}
              </span>
              <div className="flex-grow border-t border-white"></div>
            </div>

            <div className="flex justify-between gap-5">
              <div className="w-1/2">
                <button
                  type="button"
                  className="w-full h-full min-h-15 flex items-center justify-center gap-3 rounded-md py-3 px-4 bg-linear-to-tr from-[#4184e8] to-[#284cc4] text-white font-semibold "
                >
                  <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#284cc4]" />
                  </span>
                  <span>Phone Number</span>
                </button>
              </div>
              <div className="w-1/2">
                <button
                  type="button"
                  className="w-full h-full min-h-15 flex items-center justify-center gap-3 rounded-md py-3 px-4 bg-linear-to-r from-[#e2c03b] to-[#d89c2f] text-white font-semibold "
                >
                  <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#d2a72a]" />
                  </span>
                  <span>Email Address</span>
                </button>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <p className="text-md font-medium text-white mt-6">
                {t("login.label_new")}
                {"    "}
                <Link to="/register" className="text-[#6ca7ff] hover:underline">
                  {t("login.button_signup")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <OverlayModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title={errorTitle}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">{errorMessage}</p>
          <div className="flex justify-end">
            <button
              onClick={() => setErrorOpen(false)}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
            >
              Okay
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  );
}

export default Login;
