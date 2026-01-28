//Login Page
import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login({ email: username, password });
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
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
            src="../src/assets/gradient.png"
            alt="gradient"
          />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <img
            className="w-full h-auto"
            src="../src/assets/3D asset 1.png"
            alt="signup picture"
          />
        </div>
        {/* Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-1">
          <div className="w-full p-8">
            <div className="mb-5 w-full">
              <img
                className="w-full h-auto max-w-32"
                src="../src/assets/logo PNE.png"
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

              <button className="w-full py-3 px-4  bg-linear-to-tr from-[#4184e8] to-[#284cc4] text-white rounded-md font-semibold hover:bg-blue-700">
                {t("login.button_signin")}
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
                <img src="../src/assets/phone number.png" alt="Phone" />
              </div>
              <div className="w-1/2">
                <img src="../src/assets/email.png" alt="Email" />
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
    </div>
  );
}

export default Login;
