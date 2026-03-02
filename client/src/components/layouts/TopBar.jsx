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
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import HelpIcon from "../../assets/Help Icon.svg";
import AvatarIcon from "../../assets/avatar.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email?.split("@")[0] ||
    "User";
  const avatarSrc = user?.profileImageUrl
    ? user.profileImageUrl.startsWith("/")
      ? `${API_BASE}${user.profileImageUrl}`
      : user.profileImageUrl
    : AvatarIcon;

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1 text-white transition-colors hover:bg-white/10 rounded-md cursor-pointer focus:outline-none"
        >
          <img src={HelpIcon} alt="Help" className="w-5 h-5" />
          <span className="flex items-center gap-1">Help</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <ul className="absolute left-0 mt-2 w-56 bg-[#121212] border border-[#2a2a2a] rounded-md shadow-xl z-20 py-1 overflow-hidden">
              {helpLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white bg-transparent hover:bg-[#1b1b1b] hover:text-white transition-colors text-left"
                  >
                    <span className="text-[#d0d0d0]">{link.icon}</span>
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
              src={avatarSrc}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />

            <span className="text-lg font-medium text-neutral-400 tracking-wide lg:block hidden">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
