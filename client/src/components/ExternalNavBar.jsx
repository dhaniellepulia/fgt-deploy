import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector.jsx";
import { useNavigate } from "react-router-dom";

function ExternalNavBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <nav className="relative top-0 z-50 h-17.5 bg-transparent">
      <div className="max-w-[1640px] h-full mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <img
            onClick={() => navigate("/")}
            src="../../src/assets/logo PNE.png"
            className="max-w-30 h-auto cursor-pointer"
          />
        </div>
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
  );
}

export default ExternalNavBar;
