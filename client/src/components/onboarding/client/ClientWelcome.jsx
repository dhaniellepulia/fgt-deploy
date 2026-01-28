import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

const steps = [
  {
    title: "Create Projects & Questionnaires",
    description:
      "Organize your studies by project and build questionnaires that capture the feedback you need.",
  },
  {
    title: "Set a Budget",
    description:
      "Estimate your incentive budget to manage costs and participant rewards.",
  },
  {
    title: "Match Gamer Profiles",
    description:
      "Target playtesters by platform, genre preferences, and experience level.",
  },
];

function ClientWelcome() {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();

  const handleStart = () => {
    completeOnboardingStep("clientWelcomeSeen");
    navigate("/onboarding/client/questionnaires");
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[#252525] rounded-2xl p-10 border border-neutral-800">
        <h1 className="text-3xl font-bold text-[#f9b331] mb-3">
          Welcome, Client
        </h1>
        <p className="text-neutral-400 mb-8">
          Set up your first project and start recruiting the right playtesters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-[#1f1f1f] border border-neutral-800 rounded-xl p-4"
            >
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Step {index + 1}
              </p>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleStart}
            className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold py-2.5 px-10 rounded-md hover:from-blue-400 hover:to-blue-600 transition-all"
          >
            Start setup
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientWelcome;
