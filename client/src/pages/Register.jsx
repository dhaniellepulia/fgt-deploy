// Register Page
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import { useAuth } from "../auth/AuthContext";
import { countries } from "../data/countries";
import gradient from "../assets/gradient.png";
import threeD2 from "../assets/3D asset 2.png";
import logo from "../assets/logo PNE.png";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleID, setRoleID] = useState(2);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await register({ email, password, roleID });
      console.log("register response:", res);
      if (res?.pending) {
        navigate("/pending");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.message || "Registration failed");
    }
  };

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
            src={gradient}
            alt="gradient"
          />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <img
            className="w-full max-w-md h-auto"
            src={threeD2}
            alt="signup picture"
          />
        </div>
        {/* Register from */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-1">
          <div className="w-full p-8">
            <div className="mb-5 w-full">
              <img className="w-full h-auto max-w-32" src={logo} alt="logo" />
            </div>
            <h2 className="text-5xl font-semibold  mb-4">
              {t("signup.main_title")}
            </h2>

            <div className="mb-6">
              <p className="text-sm text-neutral-400 mb-3">
                Choose your account type
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoleID(2)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold border ${
                    roleID === 2
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-neutral-500"
                  }`}
                >
                  Playtester
                </button>
                <button
                  type="button"
                  onClick={() => setRoleID(3)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold border ${
                    roleID === 3
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-neutral-500"
                  }`}
                >
                  Client
                </button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg font-medium ">
                  {t("signup.label_username")}
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-medium ">
                  {t("signup.label_password")}
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-medium ">
                  {t("signup.label_fullname")}
                </label>
                <input
                  type="input"
                  required
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-lg font-medium ">
                  {t("signup.label_country")}
                </label>
                <select
                  required
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <button className="w-full mt-1 py-3 px-4  bg-linear-to-tr from-[#4184e8] to-[#284cc4] text-white rounded-md font-semibold hover:bg-blue-700">
                {t("signup.button_signup")}
              </button>
            </form>

            <div className="w-full flex justify-center">
              <p className="text-md font-medium text-white mt-6">
                {t("signup.label_member")}
                {"    "}
                <Link to="/" className="text-[#6ca7ff] hover:underline">
                  {t("signup.button_signin")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
