// Register Page
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";

function Register() {
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
            className="w-full max-w-md h-auto"
            src="../src/assets/3D asset 2.png"
            alt="signup picture"
          />
        </div>
        {/* Register from */}
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
              {t("signup.main_title")}
            </h2>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-lg font-medium ">
                  {t("signup.label_username")}
                </label>
                <input
                  type="input"
                  required
                  className="mt-1 w-full px-3 py-3 border bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <option value="">South Korea</option>
                  <option value="">United States</option>
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
