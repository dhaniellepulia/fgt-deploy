import React, { useState, useMemo, useEffect } from "react";
import {
  Compass,
  Trophy,
  Gift,
  MessageSquare,
  Users,
  Star,
  Clock,
  Calendar,
  Edit3,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function classifyGamer(motivations = [], preferences = {}) {
  const scores = {
    Explorer: 0,
    Competitor: 0,
    Socializer: 0,
    Opportunist: 0,
    Achiever: 0,
    Influencer: 0,
  };

  motivations.forEach((m) => {
    switch (m) {
      case "exploration":
        scores.Explorer += 2;
        break;
      case "competition":
        scores.Competitor += 2;
        break;
      case "social":
        scores.Socializer += 2;
        break;
      case "rewards":
        scores.Opportunist += 2;
        break;
      case "career":
        scores.Achiever += 2;
        break;
      case "feedback":
        scores.Influencer += 2;
        break;
      default:
        break;
    }
  });

  const ri = Number(preferences.rewardsImportance ?? 3);
  if (ri >= 4) scores.Opportunist += 2;
  if (ri === 3) scores.Opportunist += 1;

  const duration = preferences.preferredDuration;
  if (duration === "long") scores.Achiever += 1;
  if (duration === "short") scores.Explorer += 1;

  const freq = preferences.inviteFrequency;
  if (freq === "daily") scores.Socializer += 1;

  if (preferences.competitionPreference === "competitive")
    scores.Competitor += 2;
  if (preferences.competitionPreference === "cooperative")
    scores.Socializer += 1;
  if (preferences.taskStyle === "exploratory") scores.Explorer += 1;
  if ((preferences.feedbackDepth ?? 3) >= 4) scores.Influencer += 1;

  const max = Math.max(...Object.values(scores));
  const winners = Object.keys(scores).filter((k) => scores[k] === max);

  const priority = [
    "Explorer",
    "Achiever",
    "Competitor",
    "Socializer",
    "Opportunist",
    "Influencer",
  ];
  const gamerType =
    winners.length === 1
      ? winners[0]
      : priority.find((p) => winners.includes(p)) || winners[0];

  const descriptions = {
    Explorer:
      "You enjoy discovering new games, mechanics and experimental builds.",
    Competitor:
      "You like competition, rankings and being tested against others.",
    Socializer:
      "You test for social interactions and community-driven experiences.",
    Opportunist:
      "Rewards and incentives strongly influence which tests you pick.",
    Achiever:
      "You prefer meaningful progression, skill development and advanced tests.",
    Influencer: "You want to give feedback and shape game design.",
  };

  return { gamerType, description: descriptions[gamerType] ?? "" };
}

function Questionnaire() {
  const navigate = useNavigate();
  const { updateUser, completeOnboardingStep, token, user } = useAuth();

  const [saving, setSaving] = useState(false);

  const motivationsList = [
    {
      key: "exploration",
      label: "Explore new games",
      icon: <Compass size={28} />,
    },
    { key: "competition", label: "Competition", icon: <Trophy size={28} /> },
    { key: "social", label: "Social / community", icon: <Users size={28} /> },
    { key: "rewards", label: "Rewards", icon: <Gift size={28} /> },
    {
      key: "feedback",
      label: "Give feedback",
      icon: <MessageSquare size={28} />,
    },
    { key: "career", label: "Career / portfolio", icon: <Star size={28} /> },
  ];

  // initialize from user.gamerProfile.details if available, fallback to user.preferences
  const initialPrefs = user?.gamerProfile?.details ?? user?.preferences ?? {};
  const initialMotivations = Array.isArray(user?.motivations)
    ? user.motivations
    : (initialPrefs.motivations ?? []);

  // core states
  const [selectedMotivations, setSelectedMotivations] =
    useState(initialMotivations);

  // revised motivation-focused step states
  const [rewardTypes, setRewardTypes] = useState(
    initialPrefs.rewardTypes ?? [],
  );
  const [competitionPreference, setCompetitionPreference] = useState(
    initialPrefs.competitionPreference ?? "neutral",
  );
  const [taskStyle, setTaskStyle] = useState(
    initialPrefs.taskStyle ?? "structured",
  );
  const [feedbackDepth, setFeedbackDepth] = useState(
    initialPrefs.feedbackDepth ?? 3,
  );

  // keep some previous fields for compatibility
  const [rewardsImportance, setRewardsImportance] = useState(
    initialPrefs.rewardsImportance ?? 3,
  );
  const [preferredDuration, setPreferredDuration] = useState(
    initialPrefs.preferredDuration ?? "medium",
  );
  const [inviteFrequency, setInviteFrequency] = useState(
    initialPrefs.inviteFrequency ?? "weekly",
  );
  const [notes, setNotes] = useState(initialPrefs.notes ?? "");

  const [step, setStep] = useState(0);
  const stepsCount = 6; // motivations + 4 revised steps + summary

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
    if (!hasProfileCompleted) {
      navigate("/onboarding/additional-info", { replace: true });
    }
  }, [navigate, user]);

  function toggleMotivation(key) {
    setSelectedMotivations((s) =>
      s.includes(key) ? s.filter((x) => x !== key) : [...s, key],
    );
  }

  function toggleRewardType(key) {
    setRewardTypes((s) =>
      s.includes(key) ? s.filter((x) => x !== key) : [...s, key],
    );
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedMotivations.length > 0;
      case 1:
        return rewardTypes.length > 0;
      case 2:
        return !!competitionPreference;
      case 3:
        return !!taskStyle;
      case 4:
        return feedbackDepth != null;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const preferencesObj = {
    rewardsImportance,
    preferredDuration,
    inviteFrequency,
    notes,
    // new motivation-focused fields
    rewardTypes,
    competitionPreference,
    taskStyle,
    feedbackDepth,
  };

  const classification = useMemo(
    () => classifyGamer(selectedMotivations, preferencesObj),
    [
      selectedMotivations,
      rewardsImportance,
      preferredDuration,
      inviteFrequency,
      notes,
      rewardTypes,
      competitionPreference,
      taskStyle,
      feedbackDepth,
    ],
  );

  const handleFinish = async () => {
    try {
      setSaving(true);

      // derive extra motivations from other steps
      const derived = new Set(selectedMotivations);
      if (rewardTypes && rewardTypes.length > 0) derived.add("rewards");
      if (rewardTypes?.includes("paid")) derived.add("career");
      if (competitionPreference === "competitive") derived.add("competition");
      if (competitionPreference === "cooperative") derived.add("social");
      if (taskStyle === "exploratory") derived.add("exploration");
      if ((feedbackDepth ?? 0) >= 4) derived.add("feedback");

      const combinedKeys = Array.from(derived);

      const preferences = {
        ...preferencesObj,
        gamerType: classification.gamerType,
      };

      // explicit gamerProfile payload to persist server-side
      const gamerProfile = {
        gamerType: classification.gamerType,
        computedAt: new Date().toISOString(),
        details: { ...preferences, motivations: combinedKeys },
      };

      // local state update
      updateUser({ motivations: combinedKeys, preferences, gamerProfile });

      if (token) {
        try {
          await fetch(`${API_BASE}/user-motivations/me`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              keys: combinedKeys,
              preferences,
              gamerProfile,
            }),
          });
        } catch (e) {
          /* ignore */
        }

        // optional fallback
        try {
          await fetch(`${API_BASE}/users/me`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              motivations: combinedKeys,
              preferences,
              gamerProfile,
            }),
          });
        } catch (e) {
          /* ignore */
        }
      }

      await completeOnboardingStep("questionnaireCompleted");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err.message || "Failed to save preference");
    } finally {
      setSaving(false);
    }
  };

  const Step0 = (
    <div className="mb-6 w-full max-w-4xl">
      <h3 className="text-white font-semibold mb-3">
        Which of these motivates you to join playtests?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {motivationsList.map((m) => {
          const active = selectedMotivations.includes(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMotivation(m.key)}
              className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 flex items-center gap-4 h-36 ${active ? "bg-[#2a261a] border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.08)]" : "bg-[#1a1a1a] border-transparent opacity-80 hover:opacity-100 hover:border-neutral-700"}`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center rounded ${active ? "text-yellow-400" : "text-neutral-400"}`}
              >
                {m.icon}
              </div>
              <div className="text-left">
                <div
                  className={`text-sm font-semibold ${active ? "text-white" : "text-neutral-300"}`}
                >
                  {m.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step1: reward types (motivation-focused)
  const Step1 = (
    <div className="mb-6 w-full max-w-4xl">
      <h3 className="text-white font-semibold mb-3">
        <Gift size={18} /> Which reward types motivate you?
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "coins", label: "Coins" },
          { key: "giftcards", label: "Gift cards" },
          { key: "swag", label: "Merch / Swag" },
          { key: "earlyaccess", label: "Early access" },
          { key: "recognition", label: "Recognition / Badges" },
          { key: "paid", label: "Paid opportunities" },
        ].map((opt) => {
          const active = rewardTypes.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggleRewardType(opt.key)}
              className={`px-3 py-2 rounded ${active ? "bg-yellow-500 text-black" : "bg-neutral-800 text-white"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step2: competition vs cooperative preference
  const Step2 = (
    <div className="mb-6 w-full max-w-4xl">
      <h3 className="text-white font-semibold mb-3">
        <Trophy size={18} /> Do you prefer competitive or cooperative tests?
      </h3>
      <div className="flex gap-3">
        {[
          { key: "competitive", label: "Competitive" },
          { key: "cooperative", label: "Cooperative" },
          { key: "neutral", label: "No preference" },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setCompetitionPreference(opt.key)}
            className={`px-4 py-2 rounded ${competitionPreference === opt.key ? "bg-yellow-500 text-black" : "bg-neutral-800 text-white"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step3: task style (exploratory vs structured)
  const Step3 = (
    <div className="mb-6 w-full max-w-4xl">
      <h3 className="text-white font-semibold mb-3">
        <Compass size={18} /> Do you enjoy exploratory tasks or structured
        tasks?
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            key: "exploratory",
            label: "Exploratory",
            desc: "Open tasks, discover mechanics",
          },
          {
            key: "structured",
            label: "Structured",
            desc: "Clear objectives & checklists",
          },
          { key: "mixed", label: "Mixed", desc: "Both work for me" },
        ].map((opt) => {
          const active = taskStyle === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTaskStyle(opt.key)}
              className={`rounded-xl p-4 border-2 transition-all ${active ? "bg-[#2a261a] border-yellow-500" : "bg-[#1a1a1a] border-transparent"}`}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className="text-xs text-neutral-400">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step4: feedback depth (how much they like to provide feedback)
  const Step4 = (
    <div className="mb-8 w-full max-w-4xl">
      <h3 className="text-white font-semibold mb-3">
        <MessageSquare size={18} /> How detailed do you like to be when giving
        feedback?
      </h3>
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFeedbackDepth(v)}
            className={`px-3 py-2 rounded ${feedbackDepth === v ? "bg-yellow-500 text-black" : "bg-neutral-800 text-white"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  // Modern UI: Step5 summary / gamer profile (updated)
  const gamerIcons = {
    Explorer: <Compass size={50} />,
    Competitor: <Trophy size={50} />,
    Socializer: <Users size={50} />,
    Opportunist: <Gift size={50} />,
    Achiever: <Star size={50} />,
    Influencer: <MessageSquare size={50} />,
  };

  const Step5 = (
    <div className="mb-8 w-full max-w-4xl">
      <h3 className="text-white font-semibold mb-3">Your gamer profile</h3>

      <div className="rounded-2xl bg-[#252525] p-15 shadow-md">
        <div className="flex  gap-5">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-5 items-center">
                <div className="w-20 h-20 rounded-lg bg-[#F9B71E] flex items-center justify-center text-white">
                  {gamerIcons[classification.gamerType]}
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F9B71E]">
                    {classification.gamerType}
                  </div>
                  <div className="text-sm text-neutral-300 mt-1 max-w-xl">
                    {classification.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-neutral-400 mb-2">
                  Top motivations
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMotivations.length ? (
                    selectedMotivations.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-1 rounded-md bg-[#1c69f7] text-xs text-neutral-200 border border-[#ffffff12]"
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400 mb-2">
                  Preferred rewards
                </div>
                <div className="flex flex-wrap gap-2">
                  {rewardTypes.length ? (
                    rewardTypes.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-1 rounded-md bg-[#1c69f7] text-xs text-neutral-200 border border-[#ffffff12]"
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
                <div className="text-xs text-neutral-400">
                  Rewards importance
                </div>
                <div className="text-base font-medium text-white mt-1">
                  {rewardsImportance} / 5
                </div>
              </div>
              <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
                <div className="text-xs text-neutral-400">Preferred length</div>
                <div className="text-base font-medium text-white mt-1">
                  {preferredDuration}
                </div>
              </div>

              <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
                <div className="text-xs text-neutral-400">Invite frequency</div>
                <div className="text-base font-medium text-white mt-1">
                  {inviteFrequency}
                </div>
              </div>

              <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
                <div className="text-xs text-neutral-400">Feedback depth</div>
                <div className="text-base font-medium text-white mt-1">
                  {feedbackDepth} / 5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return Step0;
      case 1:
        return Step1;
      case 2:
        return Step2;
      case 3:
        return Step3;
      case 4:
        return Step4;
      case 5:
        return Step5;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center mb-6 max-w-2xl">
        <h2 className="text-yellow-500 font-bold text-2xl mb-2">
          Help us match you better
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          A few quick motivation-focused preferences — this helps us recommend
          the right playtests and rewards.
        </p>
        <div className="mt-3 text-xs text-neutral-400">
          Step {step + 1} of {stepsCount}
        </div>
      </div>

      {renderStep()}

      <div className="w-full max-w-4xl flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            aria-label="Back"
            className="p-2 rounded bg-neutral-900/30 text-neutral-300 hover:bg-neutral-900 transition"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div style={{ width: 42 }} />
        )}

        <div className="flex-1 text-center">
          {step < stepsCount - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (!canProceed()) return;
                setStep((s) => Math.min(stepsCount - 1, s + 1));
              }}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded font-semibold ${canProceed() ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400 cursor-not-allowed"}`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-6 py-2 rounded bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Finish"}
            </button>
          )}
        </div>

        <div style={{ width: 120 }} />
      </div>
    </div>
  );
}

export default Questionnaire;
