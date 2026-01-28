// Dashboard > Project > Test
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModalWrapper from "../components/ModalWrapper.jsx";

function ProjectTest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    const commonProps = {
      step,
      totalSteps,
      prevStep,
      onNext: nextStep,
    };

    switch (step) {
      case 1:
        return (
          <ModalWrapper {...commonProps} title="Check Your Hardware">
            <p className="text-sm text-gray-400 mb-10">
              This playtest requires to record the gameplay (screen) and your
              voice comments (microphone) to identify potential improvement
              points in the game.
            </p>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="font-bold">Select Main Screen</h3>
                <button className="bg-[#F9B71E] hover:bg-[#c48e12] text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">
                  Enable Screen
                </button>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold">Microphone Test</h3>
                <button className="bg-[#F9B71E] hover:bg-[#c48e12] text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">
                  Enable Microphone
                </button>
              </div>
            </div>
          </ModalWrapper>
        );

      case 2:
        return (
          <ModalWrapper {...commonProps} title="Accept Agreements">
            <p className="text-sm text-gray-400 mb-6">
              To start the playtest, the following requirements are mandatory in
              accordance to our{" "}
              <span
                onClick={() => navigate(`/playerterms`)}
                className="text-[#F9B71E] underline cursor-pointer"
              >
                Player Terms of Service
              </span>
              .
            </p>
            <div className="space-y-4">
              {[
                "I will not disclose any information regarding the game or this playtest.",
                "I have the age of majority or I have the authorization of my legal guardian.",
                "I am aware this game is a work in progress and might have occasional errors.",
              ].map((text, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#F9B71E] bg-transparent border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {text}
                  </span>
                </label>
              ))}
            </div>
          </ModalWrapper>
        );

      case 3:
        return (
          <ModalWrapper {...commonProps} title="Game Installation">
            <div className="bg-[#2a2a2a] p-8 rounded-lg border border-gray-700 space-y-4">
              <p className="text-sm leading-relaxed">
                Hit{" "}
                <span className="text-[#F9B71E] font-bold">Download Game</span>{" "}
                to start the installation process. Once finished, continue to
                the Next step.
              </p>
              <div className="flex flex-col items-center gap-6 py-4">
                <button className="bg-[#F9B71E] hover:bg-[#c48e12] text-white px-8 py-3 rounded font-bold transition-colors">
                  Download Game
                </button>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-[#F9B71E]" />
                  <span className="text-sm">
                    I have followed the instructions. Please, continue.
                  </span>
                </label>
              </div>
            </div>
          </ModalWrapper>
        );

      case 4:
        return (
          <ModalWrapper
            {...commonProps}
            title="Playtest Instructions"
            nextLabel="Play"
          >
            <div className="bg-[#2a2a2a] p-8 rounded-lg border border-gray-700 mb-6">
              <h3 className="font-bold mb-4 text-white">Hello again! :)</h3>
              <p className="text-sm text-gray-400 mb-4">
                Now you are ready to start. In this section you will see
                instructions to follow during the playtest, such as:
              </p>
              <ul className="text-sm text-gray-400 list-none space-y-1 ml-2">
                <li>- What to test (or what not to)</li>
                <li>
                  - How to test it (including particular controller
                  instructions)
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-[#F9B71E]" />
                <span className="text-sm italic">
                  I have carefully{" "}
                  <span className="text-[#F9B71E]">read the instructions</span>{" "}
                  above.
                </span>
              </label>
            </div>
          </ModalWrapper>
        );

      case 5:
        return (
          <ModalWrapper
            {...commonProps}
            title="Playtest in Progress"
            nextLabel="Finish Session"
            onNext={() => navigate(`/projects/${id}/survey`)}
          >
            <div className="flex flex-col items-center justify-center space-y-8 pt-10">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  The playtest will end at:
                </p>
                <h3 className="text-5xl font-mono font-bold tracking-widest text-white">
                  2:39:58 PM
                </h3>
              </div>
              <button className="bg-[#F9B71E] hover:bg-[#c48e12] text-white px-10 py-3 rounded font-bold uppercase tracking-wider transition-colors">
                Relaunch Game
              </button>
            </div>
          </ModalWrapper>
        );

      default:
        return null;
    }
  };

  return renderStep();
}

export default ProjectTest;
