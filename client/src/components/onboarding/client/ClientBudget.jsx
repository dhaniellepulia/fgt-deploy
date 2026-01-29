import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

function ClientBudget() {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();

  const handleNext = () => {
    completeOnboardingStep("clientBudgetSet");
    navigate("/onboarding/client/matching");
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#252525] rounded-2xl p-10 border border-neutral-800">
        <h2 className="text-2xl font-bold mb-2">Budget Planning</h2>
        <p className="text-neutral-400 mb-8">
          Decide how much you want to spend on incentives and participant volume.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Starter",
              body: "Small study with focused feedback.",
              points: "2?5 testers",
            },
            {
              title: "Growth",
              body: "Balanced coverage for key milestones.",
              points: "10?25 testers",
            },
            {
              title: "Scale",
              body: "Broad coverage for live tests.",
              points: "50+ testers",
            },
          ].map((tier) => (
            <div
              key={tier.title}
              className="bg-[#1f1f1f] border border-neutral-800 rounded-xl p-5"
            >
              <h3 className="font-semibold mb-2">{tier.title}</h3>
              <p className="text-sm text-neutral-400 mb-3">{tier.body}</p>
              <p className="text-xs text-neutral-500">{tier.points}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => navigate("/onboarding/client/questionnaires")}
            className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold py-2.5 px-10 rounded-md hover:from-blue-400 hover:to-blue-600 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold py-2.5 px-10 rounded-md hover:from-blue-400 hover:to-blue-600 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientBudget;
