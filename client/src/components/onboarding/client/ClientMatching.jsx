import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { updateOnboarding } from "../../../api/auth";

function ClientMatching() {
  const navigate = useNavigate();
  const { completeOnboardingStep, updateUser, token } = useAuth();

  const handleFinish = async () => {
    try {
      if (token) {
        const res = await updateOnboarding(token, {
          onboardingClientCompleted: true,
        });
        if (res?.user) {
          updateUser(res.user);
        }
      }

      updateUser({
        onboarding: {
          clientCompleted: true,
        },
      });
      await completeOnboardingStep("clientCompleted");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err.message || "Failed to complete onboarding");
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#252525] rounded-2xl p-10 border border-neutral-800">
        <h2 className="text-2xl font-bold mb-2">Gamer Profile Matching</h2>
        <p className="text-neutral-400 mb-8">
          Define the gamer profile filters that best match your target players.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1f1f1f] border border-neutral-800 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Filters you can set</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li>- Platforms (PC, console, mobile)</li>
              <li>- Genre preferences</li>
              <li>- Experience level</li>
              <li>- Region or language</li>
            </ul>
          </div>
          <div className="bg-[#1f1f1f] border border-neutral-800 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Next steps</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li>- Create your first project</li>
              <li>- Add questionnaires to each project</li>
              <li>- Publish and invite testers</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => navigate("/onboarding/client/budget")}
            className="text-neutral-400 hover:text-white"
          >
            Back
          </button>
          <button
            onClick={handleFinish}
            className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold py-2.5 px-10 rounded-md hover:from-blue-400 hover:to-blue-600 transition-all"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientMatching;
