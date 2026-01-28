//page for Onboarding > Additional Information
import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function AdditionalInformation() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    discordId: "",
    platformLanguage: "English",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    countryOrigin: "",
    countryResidence: "Philippines",
    gender: "Male",
    languages: [],
    level: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUser({
      profile: formData,
      onboarding: {
        additionalInfoCompleted: true,
      },
    });

    navigate("/onboarding/questionnaire");
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
                name="discordId"
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
                name="platformLanguage"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm appearance-none focus:outline-none"
                onChange={handleChange}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
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
                  <option>Day</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i}>{i + 1}</option>
                  ))}
                </select>
                <select
                  name="birthMonth"
                  className="bg-white text-black border border-neutral-700 rounded p-2 text-sm"
                  onChange={handleChange}
                >
                  <option>Month</option>
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
                  ].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  name="birthYear"
                  className="bg-white text-black border border-neutral-700 rounded p-2 text-sm"
                  onChange={handleChange}
                >
                  <option>Year</option>
                  {[...Array(50)].map((_, i) => (
                    <option key={i}>{2010 - i}</option>
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
                  name="countryOrigin"
                  className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                  onChange={handleChange}
                >
                  <option value="">Where are you from?</option>
                  <option>United States</option>
                  <option>Philippines</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Country of Residence <span className="text-red-500">*</span>
                </label>
                <select
                  name="countryResidence"
                  className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                  onChange={handleChange}
                >
                  <option>Philippines</option>
                  <option>United States</option>
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
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
              </select>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="block text-xs font-semibold">
                What languages do you speak?{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="languages"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                onChange={handleChange}
              >
                <option value="">Select language</option>
                <option>English</option>
                <option>Tagalog</option>
              </select>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="block text-xs font-semibold">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
                onChange={handleChange}
              >
                <option value="">Select level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Pro</option>
              </select>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold py-2 px-12 rounded active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdditionalInformation;
