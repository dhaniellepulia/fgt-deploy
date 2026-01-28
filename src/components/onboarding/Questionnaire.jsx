//page for Onboarding > Questionnaire
import React, { useState } from "react";
import { Users, UserMinus, ShieldCheck, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function Questionnaire() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("yes");
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      updateUser({
        onboarding: {
          questionnaireCompleted: true,
          profileCompleted: true,
        },
      });

      navigate("/dashboard", { replace: true });
    }
  };

  // Content for each step
  const stepContent = {
    1: {
      title: "Here to join PNE Community?",
      description:
        "By default, you will join PNE Community of players that companies use to select their testers. But, you can opt out.",
      options: [
        {
          id: "yes",
          icon: <Users size={48} />,
          label: "Yes, join the PNE Community",
          text1:
            "You will be eligible to participate in all playtests, from any company, that match your gamer profile.",
          text2:
            "You can also belong to private communities if you receive an invitation link.",
        },
        {
          id: "no",
          icon: <UserMinus size={48} />,
          label: "No, don't join the PNE Community",
          text1:
            "You will ONLY be eligible for playtests from a company's private community.",
          text2:
            "To join a private community, you will need an invitation link.",
        },
      ],
    },
    2: {
      title: "Here to join PNE Community?",
      description:
        "By default, you will join PNE Community of players that companies use to select their testers. But, you can opt out.",
      options: [
        {
          id: "yes",
          icon: <Users size={48} />,
          label: "Yes, join the PNE Community",
          text1:
            "You will be eligible to participate in all playtests, from any company, that match your gamer profile.",
          text2:
            "You can also belong to private communities if you receive an invitation link.",
        },
        {
          id: "no",
          icon: <UserMinus size={48} />,
          label: "No, don't join the PNE Community",
          text1:
            "You will ONLY be eligible for playtests from a company's private community.",
          text2:
            "To join a private community, you will need an invitation link.",
        },
      ],
    },
    3: {
      title: "Here to join PNE Community?",
      description:
        "By default, you will join PNE Community of players that companies use to select their testers. But, you can opt out.",
      options: [
        {
          id: "yes",
          icon: <Users size={48} />,
          label: "Yes, join the PNE Community",
          text1:
            "You will be eligible to participate in all playtests, from any company, that match your gamer profile.",
          text2:
            "You can also belong to private communities if you receive an invitation link.",
        },
        {
          id: "no",
          icon: <UserMinus size={48} />,
          label: "No, don't join the PNE Community",
          text1:
            "You will ONLY be eligible for playtests from a company's private community.",
          text2:
            "To join a private community, you will need an invitation link.",
        },
      ],
    },
  };

  const currentStepData = stepContent[step];

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
              step >= s ? "bg-yellow-500" : "bg-neutral-800"
            }`}
          />
        ))}
      </div>

      {/* Header Section */}
      <div className="text-center mb-10 max-w-2xl">
        <h2 className="text-yellow-500 font-bold text-2xl mb-4 transition-all duration-500">
          {currentStepData.title}
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed h-10">
          {currentStepData.description}
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
        {currentStepData.options.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`relative cursor-pointer rounded-xl p-8 border-2 transition-all duration-300 flex items-center gap-6 h-56
              ${
                selectedOption === option.id
                  ? "bg-[#2a261a] border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.15)]"
                  : "bg-[#1a1a1a] border-transparent grayscale-[0.5] opacity-70 hover:opacity-100 hover:border-neutral-700"
              }`}
          >
            <div className="flex-1 space-y-4">
              <p
                className={`text-xs leading-normal transition-colors ${
                  selectedOption === option.id
                    ? "text-neutral-200"
                    : "text-neutral-500"
                }`}
              >
                {option.text1}
              </p>
              <p
                className={`text-xs leading-normal transition-colors ${
                  selectedOption === option.id
                    ? "text-neutral-200"
                    : "text-neutral-500"
                }`}
              >
                {option.text2}
              </p>
            </div>

            <div
              className={`h-full w-[1px] mx-2 transition-colors ${
                selectedOption === option.id
                  ? "bg-yellow-500/30"
                  : "bg-neutral-800"
              }`}
            />

            <div className="flex flex-col items-center justify-center gap-3 w-32 text-center">
              <div
                className={`transition-transform duration-300 ${
                  selectedOption === option.id
                    ? "text-yellow-500 scale-110"
                    : "text-neutral-600"
                }`}
              >
                {option.icon}
              </div>
              <span
                className={`text-sm font-bold leading-tight transition-colors ${
                  selectedOption === option.id
                    ? "text-yellow-500"
                    : "text-neutral-600"
                }`}
              >
                {option.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Button */}
      <button
        onClick={handleNext}
        className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold py-2.5 px-16 rounded-md shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
      >
        {step === totalSteps ? "Finish" : "Next"}
      </button>

      {/* Step Back (Hidden on step 1) */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-neutral-500 text-sm hover:text-white transition-colors"
        >
          Go back
        </button>
      )}
    </div>
  );
}

export default Questionnaire;
