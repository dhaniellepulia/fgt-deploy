//main app top bar
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import {
  Mail,
  HelpCircle,
  FileText,
  ShieldCheck,
  AlertCircle,
  Download,
  ChevronDown,
} from "lucide-react";

const helpLinks = [
  {
    label: "Contact Page",
    path: "/contact",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    label: "FAQ",
    path: "/faq",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    label: "Player Terms of Use",
    path: "/playerterms",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Players Privacy Policy",
    path: "/privacypolicy",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    label: "Important Information",
    path: "/importantinfo",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    label: "Downloads",
    path: "/download",
    icon: <Download className="w-4 h-4" />,
  },
];

function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1 text-white transition-colors hover:bg-white/10 rounded-md cursor-pointer focus:outline-none"
        >
          <img
            src="../src/assets/Help Icon.svg"
            alt="Help"
            className="w-5 h-5"
          />
          <span className="flex items-center gap-1">
            Help
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <ul className="absolute left-0 mt-2 w-56 bg-[#222222] border border-gray-700 rounded-md shadow-xl z-20 py-1 overflow-hidden">
              {helpLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#333333] hover:text-white transition-colors text-left"
                  >
                    <span className="text-gray-400">{link.icon}</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="w-full flex justify-center">
        <div
          className="
          flex items-center justify-between
          px-6 py-3
          rounded-full
          bg-gradient-to-r from-[#2b2b2b] to-[#262626]
        "
        >
          <div className="flex items-center gap-5">
            <img
              src="../src/assets/avatar.png"
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />

            <span className="text-lg font-medium text-neutral-400 tracking-wide lg:block hidden">
              heisenberg24
            </span>
          </div>

          <ChevronDown className="text-neutral-500 w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default TopBar;
