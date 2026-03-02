//page for Profile > Gamer Profile
import React, { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Trophy,
  Gift,
  MessageSquare,
  Users,
  Star,
} from "lucide-react";
import StatCard from "../StatCard.jsx";
import { useAuth } from "../../auth/AuthContext";
import Avatar from "../../assets/avatar.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function GamerProfile() {
  const { user, token } = useAuth();
  const [coins, setCoins] = useState(0);
  const [playtestsCount, setPlaytestsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  const motivations = Array.isArray(user?.motivations) ? user.motivations : [];
  const gamerProfile = user?.gamerProfile ?? null;
  const details = gamerProfile?.details ?? {};
  const gamerType = gamerProfile?.gamerType ?? details?.gamerType ?? "Unknown";
  const descriptionByType = {
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
  const typeDescription =
    descriptionByType[gamerType] ?? "Complete onboarding to generate this.";
  const motivationLabels = {
    exploration: "Explore new games",
    competition: "Competition",
    social: "Social / community",
    rewards: "Rewards",
    feedback: "Give feedback",
    career: "Career / portfolio",
  };
  const rewardTypes = Array.isArray(details?.rewardTypes)
    ? details.rewardTypes
    : [];
  const rewardTypeLabels = {
    coins: "Coins",
    giftcards: "Gift cards",
    swag: "Merch / Swag",
    earlyaccess: "Early access",
    recognition: "Recognition / Badges",
    paid: "Paid opportunities",
  };
  const gamerIcons = {
    Explorer: <Compass size={34} />,
    Competitor: <Trophy size={34} />,
    Socializer: <Users size={34} />,
    Opportunist: <Gift size={34} />,
    Achiever: <Star size={34} />,
    Influencer: <MessageSquare size={34} />,
  };
  const stats = useMemo(
    () => [
      { id: 1, label: "Coins", value: String(coins) },
      { id: 2, label: "Playtests", value: String(playtestsCount) },
      { id: 3, label: "Sessions", value: String(sessionsCount) },
      {
        id: 4,
        label: "Background",
        value: user?.experienceLevel || "not set",
      },
    ],
    [coins, playtestsCount, sessionsCount, user?.experienceLevel],
  );

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadCounts() {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [membershipsRes, sessionsRes] = await Promise.all([
          fetch(`${API_BASE}/project-memberships/me`, { headers }),
          fetch(`${API_BASE}/questionnaire-responses/me`, { headers }),
        ]);

        if (membershipsRes.ok) {
          const membershipsData = await membershipsRes.json();
          const memberships = Array.isArray(membershipsData.items)
            ? membershipsData.items
            : membershipsData.items
              ? [membershipsData.items]
              : [];
          if (mounted) setPlaytestsCount(memberships.length);
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          const sessions = Array.isArray(sessionsData.items)
            ? sessionsData.items
            : sessionsData.items
              ? [sessionsData.items]
              : [];
          if (mounted) setSessionsCount(sessions.length);
        }
      } catch (err) {
        console.error("Failed to load profile stats", err);
      }
    }
    loadCounts();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadCoins() {
      const headers = { Authorization: `Bearer ${token}` };
      const tries = [
        `${API_BASE}/user-point-balance/me`,
        `${API_BASE}/user-point-balances/me`,
        `${API_BASE}/users/me`,
        `${API_BASE}/profile/me`,
        `${API_BASE}/profile`,
      ];

      for (const url of tries) {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) continue;
          const data = await res.json();
          const candidate =
            data.currentPoints ??
            data.current_points ??
            data.userPointBalance?.currentPoints ??
            data.userPointBalance?.current_points ??
            data.item?.currentPoints ??
            data.item?.current_points ??
            data.items?.[0]?.currentPoints ??
            null;
          if (candidate != null) {
            if (mounted) setCoins(Number(candidate));
            return;
          }
        } catch {
          // try next endpoint
        }
      }

      try {
        const res = await fetch(`${API_BASE}/point-transactions/me`, {
          headers,
        });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data.items)
          ? data.items
          : data.items
            ? [data.items]
            : data;
        const balance = (items || []).reduce(
          (acc, t) => acc + Number(t.pointsDelta ?? t.points ?? 0),
          0,
        );
        if (mounted) setCoins(balance);
      } catch {
        if (mounted) setCoins(0);
      }
    }
    loadCoins();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex justify-around items-center gap-8">
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="flex flex-col w-full">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-medium text-yellow-400">LEVEL</span>
              <span className="text-md font-medium text-yellow-400">3</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full mb-4">
              <div className="h-3 w-[10%] bg-yellow-400 rounded-full" />
            </div>
          </div>

          <img
            src={Avatar}
            alt="avatar"
            className="w-30 h-30 rounded-full bg-cyan-400"
          />
          <div className="flex flex-col justify-center items-center">
            <p className="text-white font-semibold">Dhan</p>
            <p className="text-sm text-neutral-400">@heisenberg24</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white">
          Edit Account
        </button>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Edit Profile
        </button>
      </div>

      {/* Motivations */}
      <section className="rounded-xl bg-[#252525] p-15 min-h-[180px]">
        <h2 className="text-white font-semibold mb-10">
          Your Gamer Motivations
        </h2>
        <div className="rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#F9B71E] flex items-center justify-center text-white shrink-0">
              {gamerIcons[gamerType] ?? <Star size={34} />}
            </div>
            <div>
              <div className="text-lg font-bold text-[#F9B71E]">
                {gamerType}
              </div>
              <div className="text-sm text-neutral-300 mt-1">
                {typeDescription}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-400 mb-2">
                Top motivations
              </div>
              <div className="flex flex-wrap gap-2">
                {motivations.length ? (
                  motivations.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-1 rounded-md bg-[#1c69f7] text-xs text-neutral-200 border border-[#ffffff12]"
                    >
                      {motivationLabels[m] ?? m}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500">No data yet.</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-neutral-400 mb-2">
                Preferred rewards
              </div>
              <div className="flex flex-wrap gap-2">
                {rewardTypes.length ? (
                  rewardTypes.map((reward) => (
                    <span
                      key={reward}
                      className="px-2 py-1 rounded-md bg-[#1c69f7] text-xs text-neutral-200 border border-[#ffffff12]"
                    >
                      {rewardTypeLabels[reward] ?? reward}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500">No data yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
              <div className="text-xs text-neutral-400">Feedback depth</div>
              <div className="text-base font-medium text-white mt-1">
                {details?.feedbackDepth ?? "-"} / 5
              </div>
            </div>
            <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
              <div className="text-xs text-neutral-400">Task style</div>
              <div className="text-base font-medium text-white mt-1">
                {details?.taskStyle ?? "-"}
              </div>
            </div>
            <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
              <div className="text-xs text-neutral-400">Competition</div>
              <div className="text-base font-medium text-white mt-1">
                {details?.competitionPreference ?? "-"}
              </div>
            </div>
            <div className="bg-transparent p-3 rounded-lg border border-[#464646]">
              <div className="text-xs text-neutral-400">Invite frequency</div>
              <div className="text-base font-medium text-white mt-1">
                {details?.inviteFrequency ?? "-"}
              </div>
            </div>
          </div>

          {details?.notes ? (
            <div className="mt-4">
              <div className="text-xs text-neutral-400 mb-2">Notes</div>
              <div className="text-sm text-neutral-300 bg-transparent p-3 rounded-md border border-[#464646] min-h-[56px]">
                {details.notes}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Communities */}
      <section className="rounded-xl bg-[#252525] p-6 flex justify-between items-center">
        <div>
          <h2 className="text-white font-semibold">Communities</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Do you have a new invitation code? Add it and join the community.
          </p>
        </div>

        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
          Add New Code
        </button>
      </section>
    </div>
  );
}

export default GamerProfile;
