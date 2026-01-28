// Dashboard > Project > Post-test survey
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";

function ProjectSurvey() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedOption, setSelectedOption] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/projects/${id}/success`);
  };

  const options = [
    "Be respectful, constructive and sincere",
    "Elaborate the answers as much as possible",
    "Have in mind that the playtested game is still under construction",
    "All of the above",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="flex w-full items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] font-bold text-2xl">
            Post-Test Feedback
          </h3>
        </div>
        <TopBar />
      </header>
      <form
        onSubmit={handleSubmit}
        className="w-full  bg-[#1e1e1e] rounded-xl overflow-hidden"
      >
        <div className="bg-[#323232] py-6 text-center border-gray-800">
          <h2 className="text-[#F9B71E] font-bold text-xl uppercase tracking-wide">
            About Your Experience
          </h2>
        </div>

        <div className="p-10 space-y-10 text-gray-300 bg-[#252525]">
          <section className="space-y-4">
            <h3 className="text-[#F9B71E] text-lg">1. What is the survey?</h3>
            <p className="leading-relaxed">
              You are in the 3rd part of the playtest. After playing, you will
              always be asked a few questions about your experience, the game or
              your knowledge of other games. Important:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-gray-400">
              <li>
                Most games are still under construction and aren't the final
                version.
              </li>
              <li>Be respectful and constructive</li>
              <li>Be sincere: you are not being judged.</li>
              <li>
                Be thorough: single word answers don't help to improve the game.
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg">
              1.1. What are the top most important things when providing
              feedback on a survey? <span className="text-red-500">*</span>
            </h3>

            <div className="space-y-4">
              {options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="feedback-survey"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="peer appearance-none w-6 h-6 border-2 border-gray-500 rounded-full checked:border-white transition-all"
                    />
                    <div className="absolute w-3 h-3 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span
                    className={`transition-colors ${selectedOption === option ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="p-8 flex items-center justify-end gap-6 bg-[#252525]">
          <span className="text-gray-500 text-sm">0/16 Answered</span>
          <button
            type="submit"
            className="bg-[#2d4689] hover:bg-[#3b59ab] text-gray-300 px-10 py-2.5 rounded-md font-semibold transition-all shadow-lg"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectSurvey;
