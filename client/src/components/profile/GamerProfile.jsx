//page for Profile > Gamer Profile
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Compass,
  Trophy,
  Gift,
  MessageSquare,
  Users,
  Star,
  ImagePlus,
} from "lucide-react";
import StatCard from "../StatCard.jsx";
import { useAuth } from "../../auth/AuthContext";
import OverlayModal from "../OverlayModal.jsx";
import ConfirmDialog from "../ConfirmDialog.jsx";
import Select from "../Select.jsx";
import MultiSelect from "../MultiSelect.jsx";
import { fetchGenres, fetchGames } from "../../api/metadata";
import { updateProfile } from "../../api/profile";
import { countries } from "../../data/countries";
import Avatar from "../../assets/avatar.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Greek",
  "Turkish",
  "Russian",
  "Ukrainian",
  "Arabic",
  "Hebrew",
  "Hindi",
  "Urdu",
  "Bengali",
  "Tamil",
  "Telugu",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Korean",
  "Japanese",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
];
const experienceLevels = ["Beginner", "Intermediate", "Pro"];
const fieldClass =
  "bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400 focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg w-full";

function getLevelProgress(totalXp = 0) {
  let level = 1;
  let xpIntoLevel = Math.max(0, Number(totalXp) || 0);
  let xpNeededForNext = 50 + (level - 1) * 25;

  while (xpIntoLevel >= xpNeededForNext) {
    xpIntoLevel -= xpNeededForNext;
    level += 1;
    xpNeededForNext = 50 + (level - 1) * 25;
  }

  const progressPct = Math.min(
    100,
    Math.max(0, (xpIntoLevel / xpNeededForNext) * 100),
  );

  return {
    level,
    nextLevel: level + 1,
    xpIntoLevel,
    xpNeededForNext,
    progressPct,
  };
}

function GamerProfile() {
  const { user, token, updateUser } = useAuth();
  const [coins, setCoins] = useState(0);
  const [playtestsCount, setPlaytestsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [levelState, setLevelState] = useState(() => getLevelProgress(0));
  const [communityCode, setCommunityCode] = useState("");
  const [communities, setCommunities] = useState([]);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [leavingCommunityId, setLeavingCommunityId] = useState(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveMembership, setLeaveMembership] = useState(null);
  const [communityMessage, setCommunityMessage] = useState("");
  const [communityError, setCommunityError] = useState("");
  const [genres, setGenres] = useState([]);
  const [games, setGames] = useState([]);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [accountAvatarFile, setAccountAvatarFile] = useState(null);
  const accountFileInputRef = useRef(null);
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    avatarPreview: user?.profileImageUrl || "",
  });
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    discordID: user?.discordID || "",
    platformLanguageID: user?.platformLanguageID || 1,
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    countryOriginCode: user?.countryOriginCode || "",
    countryResidenceCode: user?.countryResidenceCode || "",
    gender: user?.gender || "",
    spokenLanguages: Array.isArray(user?.spokenLanguages)
      ? user.spokenLanguages
      : [],
    experienceLevel: user?.experienceLevel || "",
    preferredGenreIDs: [],
    recentGameID: user?.recentGameID || "",
  });

  const motivations = Array.isArray(user?.motivations) ? user.motivations : [];
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const emailText = user?.email || "No email";
  const avatarSrc = user?.profileImageUrl
    ? user.profileImageUrl.startsWith("/")
      ? `${API_BASE}${user.profileImageUrl}`
      : user.profileImageUrl
    : Avatar;
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
    fetchGenres(token)
      .then((res) => setGenres(res.items || []))
      .catch(() => setGenres([]));
    fetchGames(token)
      .then((res) => setGames(res.items || []))
      .catch(() => setGames([]));
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const parsedBirth = user.birthdate ? new Date(user.birthdate) : null;
    setAccountForm((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      avatarPreview: user.profileImageUrl || prev.avatarPreview || "",
    }));
    setProfileForm((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      discordID: user.discordID || "",
      platformLanguageID: user.platformLanguageID || 1,
      birthDay: parsedBirth ? parsedBirth.getUTCDate() : "",
      birthMonth: parsedBirth ? parsedBirth.getUTCMonth() + 1 : "",
      birthYear: parsedBirth ? parsedBirth.getUTCFullYear() : "",
      countryOriginCode: user.countryOriginCode || "",
      countryResidenceCode: user.countryResidenceCode || "",
      gender: user.gender || "",
      spokenLanguages: Array.isArray(user.spokenLanguages)
        ? user.spokenLanguages
        : [],
      experienceLevel: user.experienceLevel || "",
      recentGameID: user.recentGameID || "",
    }));
  }, [user]);

  const toBirthdate = (form) => {
    if (!form.birthYear || !form.birthMonth || !form.birthDay) return null;
    return `${form.birthYear}-${String(form.birthMonth).padStart(2, "0")}-${String(
      form.birthDay,
    ).padStart(2, "0")}`;
  };

  const handleAccountAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = typeof reader.result === "string" ? reader.result : "";
      setAccountForm((prev) => ({ ...prev, avatarPreview: next }));
    };
    reader.readAsDataURL(file);
    setAccountAvatarFile(file);
  };

  const handlePickAvatar = () => {
    accountFileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setAccountAvatarFile(null);
    setAccountForm((prev) => ({ ...prev, avatarPreview: "" }));
    if (accountFileInputRef.current) {
      accountFileInputRef.current.value = "";
    }
  };

  const handleAccountSave = async () => {
    if (!token) return;
    try {
      setAccountSaving(true);
      const payload = {
        firstName: accountForm.firstName,
        lastName: accountForm.lastName,
      };
      const res = await updateProfile(token, payload);

      let nextUser = { ...(res?.user || {}) };
      if (accountAvatarFile) {
        const form = new FormData();
        form.append("image", accountAvatarFile);
        const imageRes = await fetch(`${API_BASE}/users/me/profile-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const imageData = await imageRes.json().catch(() => ({}));
        if (!imageRes.ok) {
          throw new Error(imageData?.error || "Failed to upload profile image");
        }
        nextUser = { ...nextUser, ...(imageData?.user || {}) };
      }

      updateUser(nextUser);
      setAccountAvatarFile(null);
      setAccountModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to save account");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleProfileSave = async () => {
    if (!token) return;
    try {
      setProfileSaving(true);
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phoneNumber: profileForm.phoneNumber,
        discordID: profileForm.discordID,
        platformLanguageID: Number(profileForm.platformLanguageID),
        birthdate: toBirthdate(profileForm),
        countryOriginCode: profileForm.countryOriginCode,
        countryResidenceCode: profileForm.countryResidenceCode,
        gender: profileForm.gender,
        spokenLanguages: profileForm.spokenLanguages,
        experienceLevel: profileForm.experienceLevel,
        recentGameID: profileForm.recentGameID || null,
        genreIDs: profileForm.preferredGenreIDs,
      };
      const res = await updateProfile(token, payload);
      if (res?.user) {
        updateUser({
          ...res.user,
          profileImageUrl: user?.profileImageUrl || "",
        });
      }
      setProfileModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadCommunities() {
      try {
        const res = await fetch(`${API_BASE}/communities/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const items = Array.isArray(data.items)
          ? data.items
          : data.items
            ? [data.items]
            : [];
        if (mounted) setCommunities(items);
      } catch {
        if (mounted) setCommunities([]);
      }
    }
    loadCommunities();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleJoinCommunityByCode = async () => {
    const code = communityCode.trim();
    if (!code) {
      setCommunityError("Please enter an invite code.");
      setCommunityMessage("");
      return;
    }
    if (!token) {
      setCommunityError("You need to be logged in.");
      setCommunityMessage("");
      return;
    }

    setJoiningCommunity(true);
    setCommunityError("");
    setCommunityMessage("");
    try {
      const res = await fetch(`${API_BASE}/communities/join-by-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to join community");

      const joined = data?.item || null;
      if (joined) {
        setCommunities((prev) => [joined, ...prev]);
      }
      setCommunityCode("");
      setCommunityMessage("Community joined successfully.");
    } catch (err) {
      setCommunityError(err.message || "Failed to join community");
    } finally {
      setJoiningCommunity(false);
    }
  };

  const handleLeaveCommunity = async (membershipId) => {
    if (!token) return;
    setLeavingCommunityId(membershipId);
    setCommunityError("");
    setCommunityMessage("");
    try {
      const res = await fetch(`${API_BASE}/communities/me/${membershipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to leave community");
      setCommunities((prev) =>
        prev.filter((m) => String(m.id) !== String(membershipId)),
      );
      setCommunityMessage("You left the community.");
    } catch (err) {
      setCommunityError(err.message || "Failed to leave community");
    } finally {
      setLeavingCommunityId(null);
    }
  };

  const requestLeaveCommunity = (membership) => {
    setLeaveMembership(membership);
    setLeaveConfirmOpen(true);
  };

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadXp() {
      try {
        const res = await fetch(`${API_BASE}/user-xp-balance/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const item = data?.item ?? {};
        if (!mounted) return;
        setLevelState({
          level: Number(item.currentLevel ?? 1),
          nextLevel: Number(item.nextLevel ?? 2),
          xpIntoLevel: Number(item.xpIntoLevel ?? 0),
          xpNeededForNext: Number(item.xpNeededForNextLevel ?? 50),
          progressPct: Number(item.progressPct ?? 0),
        });
      } catch {
        const fallbackXp = Number(user?.xpTotal ?? 0);
        if (mounted) setLevelState(getLevelProgress(fallbackXp));
      }
    }
    loadXp();
    return () => {
      mounted = false;
    };
  }, [token, user?.xpTotal]);

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
              <span className="text-md font-medium text-yellow-400">
                {levelState.level}
              </span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full mb-4">
              <div
                className="h-3 bg-yellow-400 rounded-full"
                style={{ width: `${levelState.progressPct}%` }}
              />
            </div>
            <p className="text-xs text-right mb-2 text-yellow-400">
              {levelState.xpIntoLevel}/{levelState.xpNeededForNext} XP
            </p>
          </div>

          <img
            src={avatarSrc}
            alt="avatar"
            className="w-30 h-30 rounded-full bg-cyan-400"
          />
          <div className="flex flex-col justify-center items-center">
            <p className="text-white font-semibold name">{fullName}</p>
            <p className="text-sm text-neutral-400 email">{emailText}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setAccountModalOpen(true)}
          className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white"
        >
          Edit Account
        </button>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
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
      <section className="rounded-xl bg-[#252525] p-6 space-y-4">
        <div>
          <h2 className="text-white font-semibold">Communities</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Enter an invite code to join a community.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            value={communityCode}
            onChange={(e) => setCommunityCode(e.target.value)}
            placeholder="Enter invite code"
            className={`${fieldClass} md:max-w-sm`}
          />
          <button
            onClick={handleJoinCommunityByCode}
            disabled={joiningCommunity}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {joiningCommunity ? "Joining..." : "Add New Code"}
          </button>
        </div>

        {communityMessage ? (
          <p className="text-sm text-green-400">{communityMessage}</p>
        ) : null}
        {communityError ? (
          <p className="text-sm text-red-400">{communityError}</p>
        ) : null}

        <div className="border-t border-[#ffffff22] pt-4">
          <p className="text-xs text-neutral-400 mb-2">Joined communities</p>
          {communities.length ? (
            <div className="space-y-2">
              <div className="grid grid-cols-12 px-4 mb-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <div className="col-span-4">Community</div>
                <div className="col-span-4">Joined</div>
                <div className="col-span-2">Code</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              {communities.map((membership) => (
                <div
                  key={membership.id}
                  className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F]"
                >
                  <div className="col-span-4 p-4 text-neutral-200">
                    {membership?.community?.name || "Unnamed community"}
                  </div>
                  <div className="col-span-4 p-4 text-neutral-400">
                    {membership?.joinedAt
                      ? new Date(membership.joinedAt).toLocaleDateString()
                      : "-"}
                  </div>
                  <div className="col-span-2 p-4 text-neutral-400 font-mono text-xs">
                    {membership?.joinedByCode || "-"}
                  </div>
                  <div className="col-span-2 p-4 text-right">
                    <button
                      onClick={() => requestLeaveCommunity(membership)}
                      disabled={leavingCommunityId === membership.id}
                      className="px-3 py-1.5 rounded border border-red-500/60 text-red-400 text-xs hover:bg-red-600/10 disabled:opacity-60"
                    >
                      {leavingCommunityId === membership.id
                        ? "Leaving..."
                        : "Leave"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              You have not joined any communities yet.
            </p>
          )}
        </div>
      </section>

      <OverlayModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        title="Edit Account"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs block mb-1">Display Photo</label>
            <div className="mt-2 rounded-xl border border-neutral-700 bg-[#1f1f1f] p-4">
              <input
                ref={accountFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAccountAvatarChange}
                className="hidden"
              />
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative">
                  {accountForm.avatarPreview ? (
                    <img
                      src={
                        accountForm.avatarPreview.startsWith("/")
                          ? `${API_BASE}${accountForm.avatarPreview}`
                          : accountForm.avatarPreview
                      }
                      alt="preview"
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-yellow-500/50"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#2f2f2f] border border-dashed border-neutral-600 flex items-center justify-center text-neutral-400">
                      <ImagePlus size={24} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-300">
                    Upload a clear square image for best results.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handlePickAvatar}
                      className="rounded-md bg-yellow-500 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-400"
                    >
                      Choose Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="rounded-md border border-neutral-600 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"
                    >
                      Remove
                    </button>
                  </div>
                  {accountAvatarFile ? (
                    <p className="text-xs text-neutral-400 truncate max-w-xs">
                      {accountAvatarFile.name}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1">First Name</label>
              <input
                type="text"
                value={accountForm.firstName}
                onChange={(e) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Last Name</label>
              <input
                type="text"
                value={accountForm.lastName}
                onChange={(e) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setAccountModalOpen(false)}
              className="rounded-md bg-neutral-700 px-4 py-2 text-sm text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAccountSave}
              disabled={accountSaving}
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {accountSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-6">
          <section className="bg-[#252525] rounded-lg p-4 border border-neutral-800">
            <h2 className="text-[#F9B71E] font-bold text-sm uppercase tracking-wider mb-2">
              Your Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className={fieldClass}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className={fieldClass}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={profileForm.phoneNumber}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className={fieldClass}
              />
              <input
                type="text"
                placeholder="Discord ID"
                value={profileForm.discordID}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    discordID: e.target.value,
                  }))
                }
                className={fieldClass}
              />
              <Select
                name="platformLanguageID"
                value={profileForm.platformLanguageID}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    platformLanguageID: e.target.value,
                  }))
                }
                className="w-full"
                placeholder="Platform language"
                options={[
                  { value: 1, label: "English" },
                  { value: 2, label: "Korean" },
                  { value: 3, label: "Japanese" },
                ]}
              />
            </div>
          </section>

          <section className="bg-[#252525] rounded-lg p-4 border border-neutral-800">
            <h2 className="text-[#F9B71E] font-bold text-sm uppercase tracking-wider mb-2">
              About You
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Select
                  name="birthDay"
                  value={profileForm.birthDay}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      birthDay: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Day"
                  options={[...Array(31)].map((_, i) => ({
                    value: i + 1,
                    label: String(i + 1),
                  }))}
                />
                <Select
                  name="birthMonth"
                  value={profileForm.birthMonth}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      birthMonth: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Month"
                  options={[
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
                  ].map((m, index) => ({
                    value: index + 1,
                    label: m,
                  }))}
                />
                <Select
                  name="birthYear"
                  value={profileForm.birthYear}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      birthYear: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Year"
                  options={[...Array(60)].map((_, i) => ({
                    value: 2010 - i,
                    label: String(2010 - i),
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  name="countryOriginCode"
                  value={profileForm.countryOriginCode}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      countryOriginCode: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Country of Origin"
                  options={countries.map((country) => ({
                    value: country.code,
                    label: country.name,
                  }))}
                />
                <Select
                  name="countryResidenceCode"
                  value={profileForm.countryResidenceCode}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      countryResidenceCode: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Country of Residence"
                  options={countries.map((country) => ({
                    value: country.code,
                    label: country.name,
                  }))}
                />
              </div>
              <Select
                name="gender"
                value={profileForm.gender}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                className="w-full"
                placeholder="Select gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ]}
              />
              <MultiSelect
                value={profileForm.spokenLanguages}
                onChange={(values) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    spokenLanguages: values,
                  }))
                }
                options={languageOptions.map((language) => ({
                  value: language,
                  label: language,
                }))}
                placeholder="Select spoken languages"
              />
              <Select
                name="experienceLevel"
                value={profileForm.experienceLevel}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    experienceLevel: e.target.value,
                  }))
                }
                className="w-full"
                placeholder="Select level"
                options={experienceLevels.map((level) => ({
                  value: level,
                  label: level,
                }))}
              />
            </div>
          </section>

          <section className="bg-[#252525] rounded-lg p-4 border border-neutral-800">
            <h2 className="text-[#F9B71E] font-bold text-sm uppercase tracking-wider mb-2">
              Game Preferences
            </h2>
            <div className="space-y-4">
              <MultiSelect
                value={profileForm.preferredGenreIDs}
                onChange={(values) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    preferredGenreIDs: values,
                  }))
                }
                options={genres.map((genre) => ({
                  value: genre.gameGenreID,
                  label: genre.name,
                }))}
                placeholder="Select preferred genres"
              />
              <Select
                name="recentGameID"
                value={profileForm.recentGameID}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    recentGameID: e.target.value,
                  }))
                }
                className="w-full"
                placeholder="Most Recently Played Game"
                options={games.map((game) => ({
                  value: game.gameID,
                  label: game.name,
                }))}
              />
            </div>
          </section>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="rounded-md bg-neutral-700 px-4 py-2 text-sm text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <ConfirmDialog
        isOpen={leaveConfirmOpen}
        title="Leave Community"
        message={`Are you sure you want to leave "${leaveMembership?.community?.name || "this community"}"?`}
        confirmLabel="Leave"
        cancelLabel="Cancel"
        danger
        onCancel={() => {
          setLeaveConfirmOpen(false);
          setLeaveMembership(null);
        }}
        onConfirm={async () => {
          if (!leaveMembership?.id) return;
          await handleLeaveCommunity(leaveMembership.id);
          setLeaveConfirmOpen(false);
          setLeaveMembership(null);
        }}
      />
    </div>
  );
}

export default GamerProfile;
