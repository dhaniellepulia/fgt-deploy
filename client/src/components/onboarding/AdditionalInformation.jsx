//page for Onboarding > Additional Information
import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchGenres, fetchGames } from "../../api/metadata";
import { updateProfile } from "../../api/profile";
import { countries } from "../../data/countries";

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Greek",
  "Turkish",
  "Russian",
  "Ukrainian",
  "Arabic",
  "Hebrew",
  "Hindi",
  "Urdu",
  "Bengali",
  "Tamil",
  "Telugu",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Korean",
  "Japanese",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
];
const experienceLevels = ["Beginner", "Intermediate", "Pro"];

function AdditionalInformation() {
  const navigate = useNavigate();
  const { updateUser, completeOnboardingStep, token } = useAuth();
  const [genres, setGenres] = useState([]);
  const [games, setGames] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    discordID: "",
    platformLanguageID: 1,
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    countryOriginCode: "",
    countryResidenceCode: "",
    gender: "",
    spokenLanguages: [],
    experienceLevel: "",
    preferredGenreIDs: [],
    recentGameID: "",
  });

  useEffect(() => {
    if (!token) return;
    fetchGenres(token)
      .then((res) => setGenres(res.items || []))
      .catch(() => setGenres([]));
    fetchGames(token)
      .then((res) => setGames(res.items || []))
      .catch(() => setGames([]));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguagesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, spokenLanguages: selected }));
  };

  const handleGenreToggle = (genreID) => {
    setFormData((prev) => ({
      ...prev,
      preferredGenreIDs: prev.preferredGenreIDs.includes(genreID)
        ? prev.preferredGenreIDs.filter((id) => id !== genreID)
        : [...prev.preferredGenreIDs, genreID],
    }));
  };

  const toBirthdate = () => {
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      return null;
    }
    return `${formData.birthYear}-${String(formData.birthMonth).padStart(
      2,
      "0"
    )}-${String(formData.birthDay).padStart(2, "0")}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const birthdate = toBirthdate();

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        discordID: formData.discordID,
        platformLanguageID: formData.platformLanguageID,
        birthdate,
        countryOriginCode: formData.countryOriginCode,
        countryResidenceCode: formData.countryResidenceCode,
        gender: formData.gender,
        spokenLanguages: formData.spokenLanguages,
        experienceLevel: formData.experienceLevel,
        recentGameID: formData.recentGameID || null,
        genreIDs: formData.preferredGenreIDs,
      };

      const res = await updateProfile(token, payload);
      if (res?.user) {
        updateUser(res.user);
      }

      await completeOnboardingStep("profileCompleted");
      navigate("/onboarding/questionnaire");
    } catch (err) {
      alert(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="bg-[#252525] rounded-lg p-6 border border-neutral-800 ">
          <h2 className="text-[#F9B71E] font-bold text-lg uppercase tracking-wider mb-1">
            Your Account
          </h2>
          <hr className="border-neutral-700 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                Phone Number
              </label>
              <div className="flex border border-neutral-700">
                <div className="bg-[#e5e5e5] text-black px-3 flex items-center rounded-l text-sm font-medium">
                  +
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  className="w-full bg-white text-black rounded-r p-2.5 text-sm focus:outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">Discord ID</label>
              <input
                type="text"
                name="discordID"
                placeholder="yourusername000"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm focus:outline-none"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-semibold">
                Platform Language
              </label>
              <select
                name="platformLanguageID"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm appearance-none focus:outline-none"
                onChange={handleChange}
              >
                <option value={1}>English</option>
                <option value={2}>Korean</option>
                <option value={3}>Japanese</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-[#252525] rounded-lg p-6 border border-neutral-800 ">
          <h2 className="text-[#F9B71E] font-bold text-lg uppercase tracking-wider mb-1">
            About You
          </h2>
          <hr className="border-neutral-700 mb-6" />

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                Birthdate <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4 max-w-sm">
                <select
                  name="birthDay"
                  className="bg-white border text-black border-neutral-700 rounded p-2 text-sm"
                  onChange={handleChange}
                >
                  <option value="">Day</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  name="birthMonth"
                  className="bg-white text-black border border-neutral-700 rounded p-2 text-sm"
                  onChange={handleChange}
                >
                  <option value="">Month</option>
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((m, index) => (
                    <option key={m} value={index + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  name="birthYear"
                  className="bg-white text-black border border-neutral-700 rounded p-2 text-sm"
                  onChange={handleChange}
                >
                  <option value="">Year</option>
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={2010 - i}>
                      {2010 - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Country of Origin <span className="text-red-500">*</span>
                </label>
                <select
                  name="countryOriginCode"
                  className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                  onChange={handleChange}
                >
                  <option value="">Where are you from?</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Country of Residence <span className="text-red-500">*</span>
                </label>
                <select
                  name="countryResidenceCode"
                  className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                  onChange={handleChange}
                >
                  <option value="">Where do you live now?</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <label className="block text-xs font-semibold">
                Gender Identity <span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] text-neutral-400">
                This will determine the playtests for which you are eligible.
              </p>
              <select
                name="gender"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="block text-xs font-semibold">
                What languages do you speak?{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                name="spokenLanguages"
                value={formData.spokenLanguages}
                onChange={handleLanguagesChange}
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm min-h-32"
              >
                {languageOptions.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-400">
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
              </p>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="block text-xs font-semibold">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experienceLevel"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                onChange={handleChange}
              >
                <option value="">Select level</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-[#252525] rounded-lg p-6 border border-neutral-800 ">
          <h2 className="text-[#F9B71E] font-bold text-lg uppercase tracking-wider mb-1">
            Game Preferences
          </h2>
          <hr className="border-neutral-700 mb-6" />

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold mb-2">
                Preferred Genres
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {genres.map((genre) => (
                  <label
                    key={genre.gameGenreID}
                    className="flex items-center gap-2 text-sm text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferredGenreIDs.includes(
                        genre.gameGenreID
                      )}
                      onChange={() => handleGenreToggle(genre.gameGenreID)}
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                Most Recently Played Game
              </label>
              <select
                name="recentGameID"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                onChange={handleChange}
              >
                <option value="">Select a game</option>
                {games.map((game) => (
                  <option key={game.gameID} value={game.gameID}>
                    {game.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-400 mt-2">
                Use this to help clients match playtesters with similar
                mechanics.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold py-2 px-12 rounded active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdditionalInformation;
