//page for Onboarding > Additional Information
import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchGenres, fetchGames } from "../../api/metadata";
import { updateProfile } from "../../api/profile";
import { countries } from "../../data/countries";
import Select from "../Select.jsx";
import MultiSelect from "../MultiSelect.jsx";

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
const fieldClass =
  "bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400 focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg w-full";

function AdditionalInformation() {
  const navigate = useNavigate();
  const { updateUser, completeOnboardingStep, token, user } = useAuth();
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

  useEffect(() => {
    const localOnboarding = user?.onboarding || {};
    const hasProfileCompleted = Boolean(
      user?.onboardingProfileCompleted || localOnboarding.profileCompleted,
    );
    const hasQuestionnaireCompleted = Boolean(
      user?.onboardingQuestionnaireCompleted ||
      localOnboarding.questionnaireCompleted,
    );

    if (hasQuestionnaireCompleted) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (hasProfileCompleted) {
      navigate("/onboarding/questionnaire", { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toBirthdate = () => {
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      return null;
    }
    return `${formData.birthYear}-${String(formData.birthMonth).padStart(
      2,
      "0",
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
                className={fieldClass}
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
                className={fieldClass}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                Phone Number
              </label>
              <div className="flex border border-gray-500 rounded-lg overflow-hidden">
                <div className="bg-[#2f2f2f] text-gray-300 px-3 flex items-center text-sm font-medium">
                  +63
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  className={`${fieldClass} border-0 rounded-none`}
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
                className={fieldClass}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-semibold">
                Platform Language
              </label>
              <Select
                name="platformLanguageID"
                className="w-full"
                placeholder="Select language"
                options={[
                  { value: 1, label: "English" },
                  { value: 2, label: "Korean" },
                  { value: 3, label: "Japanese" },
                ]}
                value={formData.platformLanguageID}
                onChange={handleChange}
              />
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
                <Select
                  name="birthDay"
                  className="w-full"
                  placeholder="Day"
                  value={formData.birthDay}
                  options={[...Array(31)].map((_, i) => ({
                    value: i + 1,
                    label: String(i + 1),
                  }))}
                  onChange={handleChange}
                />
                <Select
                  name="birthMonth"
                  className="w-full"
                  placeholder="Month"
                  value={formData.birthMonth}
                  options={[
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
                  ].map((m, index) => ({
                    value: index + 1,
                    label: m,
                  }))}
                  onChange={handleChange}
                />
                <Select
                  name="birthYear"
                  className="w-full"
                  placeholder="Year"
                  value={formData.birthYear}
                  options={[...Array(60)].map((_, i) => ({
                    value: 2010 - i,
                    label: String(2010 - i),
                  }))}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Country of Origin <span className="text-red-500">*</span>
                </label>
                <Select
                  name="countryOriginCode"
                  className="w-full"
                  placeholder="Where are you from?"
                  options={countries.map((country) => ({
                    value: country.code,
                    label: country.name,
                  }))}
                  value={formData.countryOriginCode}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Country of Residence <span className="text-red-500">*</span>
                </label>
                <Select
                  name="countryResidenceCode"
                  className="w-full"
                  placeholder="Where do you live now?"
                  options={countries.map((country) => ({
                    value: country.code,
                    label: country.name,
                  }))}
                  value={formData.countryResidenceCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <label className="block text-xs font-semibold">
                Gender Identity <span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] text-neutral-400">
                This will determine the playtests for which you are eligible.
              </p>
              <Select
                name="gender"
                className="w-full"
                placeholder="Select gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ]}
                value={formData.gender}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="block text-xs font-semibold">
                What languages do you speak?{" "}
                <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                value={formData.spokenLanguages}
                onChange={(values) =>
                  setFormData((prev) => ({ ...prev, spokenLanguages: values }))
                }
                options={languageOptions.map((language) => ({
                  value: language,
                  label: language,
                }))}
                placeholder="Select spoken languages"
              />
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="block text-xs font-semibold">
                Level <span className="text-red-500">*</span>
              </label>
              <Select
                name="experienceLevel"
                className="w-full"
                placeholder="Select level"
                value={formData.experienceLevel}
                options={experienceLevels.map((level) => ({
                  value: level,
                  label: level,
                }))}
                onChange={handleChange}
              />
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
              <MultiSelect
                value={formData.preferredGenreIDs}
                onChange={(values) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredGenreIDs: values,
                  }))
                }
                options={genres.map((genre) => ({
                  value: genre.gameGenreID,
                  label: genre.name,
                }))}
                placeholder="Select preferred genres"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">
                Most Recently Played Game
              </label>
              <Select
                name="recentGameID"
                className="w-full"
                placeholder="Select a game"
                options={games.map((game) => ({
                  value: game.gameID,
                  label: game.name,
                }))}
                value={formData.recentGameID}
                onChange={handleChange}
              />
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
