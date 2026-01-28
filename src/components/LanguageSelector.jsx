import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown } from "lucide-react";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English", country: "US" },
    { code: "kr", label: "한국어", country: "KR" },
  ];

  const currentLang = languages.find((lang) => lang.code === i18n.language);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem("lang", lang.code);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2  text-white px-3 py-1 rounded"
      >
        <ReactCountryFlag svg countryCode={currentLang.country} />
        <span>{currentLang.label}</span>

        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 text-black bg-white border rounded shadow">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
            >
              <ReactCountryFlag svg countryCode={lang.country} />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
