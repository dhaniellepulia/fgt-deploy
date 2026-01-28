import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

function ClientQuestionnaires() {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();

  const handleNext = () => {
    completeOnboardingStep("clientQuestionnairesReady");
    navigate("/onboarding/client/budget");
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#252525] rounded-2xl p-10 border border-neutral-800">
        <h2 className="text-2xl font-bold mb-2">Questionnaire Setup</h2>
        <p className="text-neutral-400 mb-8">
          Create questionnaires for each project to capture structured feedback.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1f1f1f] border border-neutral-800 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Suggested structure</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li>- Project overview and goals</li>
              <li>- Core gameplay questions</li>
              <li>- Bugs and UX pain points</li>
              <li>- Overall rating and comments</li>
            </ul>
          </div>
          <div className="bg-[#1f1f1f] border border-neutral-800 rounded-xl p-5">
            <h3 className="font-semibold mb-2">What you can do next</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li>- Create a project</li>
              <li>- Add questionnaires per milestone</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => navigate("/onboarding/client")}
            className="text-neutral-400 hover:text-white"
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

export default ClientQuestionnaires;
