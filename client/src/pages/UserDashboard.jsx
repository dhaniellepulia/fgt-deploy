// Dashboard > User Dashboard menu

import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { ChevronRight } from "lucide-react";
import TopBar from "../components/layouts/TopBar.jsx";
import { useAuth } from "../auth/AuthContext";

import Coin from "../assets/coin.svg";
import Time from "../assets/time.svg";
import DiscordLogo from "../assets/discord logo.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
function UserDashboard() {
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [playtestsCount, setPlaytestsCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  const [achievements, setAchievements] = useState([
    {
      id: "account_created",
      title: "Account created",
      completed: false,
      progress: "1/1",
    },
    {
      id: "profile_completed",
      title: "Profile completed",
      completed: false,
      progress: "0/1",
    },
    {
      id: "onboarding_questionnaire",
      title: "Onboarding questionnaire completed",
      completed: false,
      progress: "0/1",
    },
    {
      id: "email_verified",
      title: "Email verified",
      completed: false,
      progress: "0/1",
    },
    {
      id: "join_playtest",
      title: "Join a playtest",
      completed: false,
      progress: "0/1",
    },
    {
      id: "first_session",
      title: "Complete first session",
      completed: false,
      progress: "0/1",
    },
  ]);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/questionnaire-responses/me`, {
          headers,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!mounted) return;
        setSessions(
          Array.isArray(data.items)
            ? data.items
            : data.items
              ? [data.items]
              : [],
        );
      } catch (e) {
        console.error("load last sessions failed", e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    // load joined projects (membership) and derive status + points
    let mounted = true;
    async function loadMyProjects() {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // try membership endpoint first; fallback to projects list if not available
        let memberships = [];
        try {
          const mres = await fetch(`${API_BASE}/project-memberships/me`, {
            headers,
          });
          if (mres.ok) {
            const mdata = await mres.json();
            memberships = Array.isArray(mdata.items)
              ? mdata.items
              : mdata.items
                ? [mdata.items]
                : [];
            if (mounted) setPlaytestsCount(memberships.length);
          }
        } catch (e) {
          // ignore
        }

        // build projects list from memberships or fallback to projects where user isJoined
        let projects = memberships.map((m) => m.project).filter(Boolean);
        if (!projects.length) {
          try {
            const pres = await fetch(`${API_BASE}/projects`, { headers });
            if (pres.ok) {
              const pdata = await pres.json();
              projects = (pdata.items || []).filter((p) => p.isJoined);
            }
          } catch (e) {
            // ignore
          }
        }

        const needEnrich = projects.filter(
          (p) =>
            (p.points == null || p.points === undefined) &&
            (p.projectID || p.id),
        );
        if (needEnrich.length) {
          try {
            const details = await Promise.all(
              needEnrich.map(async (p) => {
                const pid = p.projectID ?? p.id;
                const r = await fetch(`${API_BASE}/projects/${pid}`, {
                  headers,
                });
                if (!r.ok) return null;
                const j = await r.json();
                // common shapes: { item: { ... } } or { project: {...} } or raw
                const detail = j.item ?? j.project ?? j;
                return { pid: String(pid), detail };
              }),
            );
            projects = projects.map((p) => {
              const pid = String(p.projectID ?? p.id);
              const found = details.find((d) => d && d.pid === pid);
              return found && found.detail ? { ...found.detail, ...p } : p;
            });
          } catch (e) {
            console.debug("project detail enrichment failed", e);
          }
        }

        if (mounted && !memberships.length && projects.length)
          setPlaytestsCount(projects.length);
        // derive status using sessions (in-progress/completed)
        const respMap = {};
        sessions.forEach((s) => {
          const pid = s.project?.projectID ?? s.project?.id;
          if (!pid) return;
          if (!respMap[pid]) respMap[pid] = [];
          respMap[pid].push(s);
        });

        const items = projects
          .map((p) => {
            const pid = p.projectID ?? p.id;
            const projectSessions = respMap[pid] || [];
            // determine status: Completed if any submitted response, In Progress if any started but not submitted, else Joined
            let status = "Joined";
            if (
              projectSessions.some(
                (r) => Number(r.responseStatusID) === 2 || r.submittedAt,
              )
            ) {
              status = "Completed";
            } else if (
              projectSessions.some((r) => r.startedAt && !r.submittedAt)
            ) {
              status = "In Progress";
            }
            // compute points: prefer project.points, else sum questionnaire pointsReward if present
            let points = p.points ?? p.pointsReward ?? null;
            if (points == null && Array.isArray(p.questionnaires)) {
              points =
                p.questionnaires.reduce(
                  (sum, q) => sum + (q.pointsReward ?? 0),
                  0,
                ) || null;
            }
            const image =
              p.projectImageUrl || p.imageUrl || p.projectImage || null;
            return {
              id: pid,
              title: p.title || p.projectTitle || "Untitled",
              status,
              points,
              image,
            };
          })
          // sort: prefer latest joined (membership.createdAt) then fallback keep order
          .slice(0, 3);

        if (mounted) setMyProjects(items);
      } catch (err) {
        console.error("failed to load my projects", err);
      }
    }
    loadMyProjects();
    return () => {
      mounted = false;
    };
  }, [token, sessions]);

  useEffect(() => {
    setSessionsCount(sessions.length || 0);
  }, [sessions]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadBalance() {
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
          if (!res.ok) {
            // log response body for debugging (server message)
            const txt = await res.text().catch(() => "");
            console.debug(`fetch ${url} failed:`, res.status, txt);
            continue;
          }
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
          if (
            data.userPointBalance &&
            data.userPointBalance.currentPoints != null
          ) {
            if (mounted) setCoins(Number(data.userPointBalance.currentPoints));
            return;
          }
        } catch (e) {
          console.debug("fetch error", e);
        }
      }

      // fallback: try point transactions endpoint to compute current balance
      try {
        const res2 = await fetch(`${API_BASE}/point-transactions/me`, {
          headers,
        });
        if (res2.ok) {
          const data2 = await res2.json();
          const items = Array.isArray(data2.items)
            ? data2.items
            : data2.items
              ? [data2.items]
              : data2;
          const balance = (items || []).reduce(
            (acc, t) => acc + Number(t.pointsDelta ?? t.points ?? 0),
            0,
          );
          if (mounted) setCoins(balance);
          return;
        } else {
          const txt = await res2.text().catch(() => "");
          console.debug("point-transactions/me failed:", res2.status, txt);
        }
      } catch (e) {
        console.debug("point-transactions/me error", e);
      }

      if (mounted) setCoins(0);
    }
    loadBalance();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (playtestsCount) return; // respect membership-derived value
    if (myProjects?.length) {
      setPlaytestsCount(myProjects.length);
      return;
    }
    const unique = new Set();
    sessions.forEach((s) => {
      const pid = s.project?.projectID ?? s.project?.id;
      if (pid) unique.add(String(pid));
    });
    setPlaytestsCount(unique.size);
  }, [myProjects, sessions, playtestsCount]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadAchievements() {
      const headers = { Authorization: `Bearer ${token}` };
      // fetch user profile (try common endpoints)
      let user = null;
      try {
        const r = await fetch(`${API_BASE}/auth/me`, { headers });
        if (r.ok) {
          const j = await r.json();
          user = j?.user ?? null;
        } else {
          console.debug(
            "/auth/me failed:",
            r.status,
            await r.text().catch(() => ""),
          );
        }
      } catch (e) {
        console.debug("/auth/me error", e);
      }

      // fetch memberships
      let memberships = [];
      try {
        const res = await fetch(`${API_BASE}/project-memberships/me`, {
          headers,
        });
        if (res.ok) {
          const j = await res.json();
          memberships = Array.isArray(j.items)
            ? j.items
            : j.items
              ? [j.items]
              : [];
        }
      } catch (e) {}

      // fetch sessions/responses (all statuses)
      let responses = [];
      try {
        const res = await fetch(
          `${API_BASE}/questionnaire-responses/me?status=all`,
          { headers },
        );
        if (res.ok) {
          const j = await res.json();
          responses = Array.isArray(j.items)
            ? j.items
            : j.items
              ? [j.items]
              : [];
        }
      } catch (e) {}

      if (!mounted) return;

      const acctCreated = !!(user?.createdAt || user?.created_at || user?.id);
      const profileCompleted = !!(
        user?.onboardingProfileCompleted ?? user?.onboarding_profile_completed
      );
      const onboardingQuestionnaire = !!(
        user?.onboardingQuestionnaireCompleted ??
        user?.onboarding_questionnaire_completed
      );
      const emailVerified = !!(
        user?.emailVerifiedAt ??
        user?.email_verified_at ??
        user?.isEmailVerified ??
        user?.email_verified
      );
      const joinedPlaytest = memberships.length > 0;
      const firstSession = responses.length > 0;

      const updated = [
        {
          id: "account_created",
          title: "Account created",
          completed: acctCreated,
          progress: acctCreated ? "1/1" : "0/1",
        },
        {
          id: "profile_completed",
          title: "Profile completed",
          completed: profileCompleted,
          progress: profileCompleted ? "1/1" : "0/1",
        },

        {
          id: "onboarding_questionnaire",
          title: "Onboarding questionnaire completed",
          completed: onboardingQuestionnaire,
          progress: onboardingQuestionnaire ? "1/1" : "0/1",
        },
        {
          id: "email_verified",
          title: "Email verified",
          completed: emailVerified,
          progress: emailVerified ? "1/1" : "0/1",
        },
        {
          id: "join_playtest",
          title: "Join a playtest",
          completed: joinedPlaytest,
          progress: joinedPlaytest ? "1/1" : "0/1",
        },
        {
          id: "first_session",
          title: "Complete first session",
          completed: firstSession,
          progress: firstSession ? "1/1" : "0/1",
        },
      ];

      setAchievements(updated);
    }
    loadAchievements();
    return () => {
      mounted = false;
    };
  }, [token]);

  const displayName =
    user?.name ||
    user?.profile?.firstName ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap-reverse items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] text-2xl">
            Welcome, <strong>{displayName}!</strong>
          </h3>
        </div>
        <TopBar />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Last Sessions" action>
            <ul className="space-y-4">
              {sessions.slice(0, 3).map((s, i) => {
                const projectTitle = s.project?.title || "Untitled";
                const questionnaireTitle = s.questionnaire?.title || "Survey";
                const projectImg =
                  s.project?.projectImageUrl ||
                  s.project?.imageUrl ||
                  s.project?.projectImage ||
                  null;
                const startedAt = s.startedAt;
                const endedAt = s.submittedAt;
                const diffSec = startedAt
                  ? Math.max(
                      0,
                      Math.floor(
                        (new Date(endedAt || Date.now()).getTime() -
                          new Date(startedAt).getTime()) /
                          1000,
                      ),
                    )
                  : null;
                const mins =
                  diffSec != null
                    ? String(Math.floor(diffSec / 60)).padStart(2, "0")
                    : "--";
                const secs =
                  diffSec != null
                    ? String(diffSec % 60).padStart(2, "0")
                    : "--";
                const duration = diffSec != null ? `${mins}:${secs}` : "--:--";

                return (
                  <li
                    key={s.id ?? i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {projectImg ? (
                        <div className="w-10 h-10 rounded bg-neutral-700 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              typeof projectImg === "string" &&
                              projectImg.startsWith("/")
                                ? `${API_BASE}${projectImg}`
                                : projectImg
                            }
                            alt={projectTitle}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              console.warn(
                                "project image failed to load:",
                                projectImg,
                              );
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/fallback-project.png"; // small local fallback
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-neutral-700" />
                      )}
                      <div>
                        <p className="text-white text-md">
                          {questionnaireTitle}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          {projectTitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-md">{duration}</p>
                      <p className="text-xs text-neutral-400">Duration</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="My Projects" action>
            <ul className="space-y-4">
              {myProjects.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {p.image ? (
                      <div className="w-10 h-10 rounded bg-neutral-700 flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            typeof p.image === "string" &&
                            p.image.startsWith("/")
                              ? `${API_BASE}${p.image}`
                              : p.image
                          }
                          alt={p.title}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-neutral-700" />
                    )}
                    <div>
                      <p className="text-white text-md">{p.title}</p>
                      <p
                        className={`text-xs ${p.status === "Completed" ? "text-[#8CFF82]" : p.status === "In Progress" ? "text-yellow-400" : "text-neutral-400"}`}
                      >
                        {p.status}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white text-md">{p.points ?? 0}</p>
                    <p className="text-xs text-neutral-400">Points</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Community">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <p className="text-sm text-neutral-400 lg:max-w-sm">
                In addition to the platform, join the PNE community in our
                Discord server to meet other gamers and know more about our
                running playtests!
              </p>

              <div className="flex flex-row items-center gap-2">
                <img
                  className="max-w-[80px] w-full h-auto"
                  src={DiscordLogo}
                  alt="discord logo"
                />
                <button className="inline gap-2 rounded-md bg-yellow-400 py-1 px-3 text-sm font-semibold text-white hover:bg-yellow-300 transition">
                  Join Discord
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border-[#ffffff73] border-1 bg-gradient-to-l from-[#372533] to-[#32325C] p-10 text-white">
            <h3 className="font-semibold mb-4 text-2xl">Account Status</h3>

            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[#F9B71E]">2</span>
              <span className="text-[#F9B71E] text-lg font-bold">LEVEL</span>
              <span className="text-[#F9B71E]">3</span>
            </div>

            <div className="w-full h-3 bg-white/20 rounded-full mb-4">
              <div className="h-3 w-[10%] bg-yellow-400 rounded-full" />
            </div>

            <p className="text-xs text-right mb-8 text-[#F9B71E]">5/51 XP</p>
            <hr className="border-[#ffffff73] border-1 mb-4" />
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="opacity-70 mb-2">PLAYTESTS</p>
                <p className="text-lg font-medium">{playtestsCount}</p>
              </div>
              <div>
                <p className="opacity-70 mb-2">SESSIONS</p>
                <p className="text-lg font-medium">{sessionsCount}</p>
              </div>
              <div>
                <p className="opacity-70 mb-2">COINS</p>
                <p className="text-lg font-medium">{coins}</p>
              </div>
            </div>
          </div>

          <Card
            title="Achievements"
            action={
              <span className="text-yellow-400 font-bold text-2xl">
                <span className="text-white">
                  {achievements.filter((a) => a.completed).length}
                </span>
                /{achievements.length}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`relative h-28 rounded-2xl p-4 text-white text-sm shadow-md ${a.completed ? "bg-[#4152B3]" : "bg-neutral-800"}`}
                >
                  {a.completed && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-400 text-[#4152B3] flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}

                  <p className="absolute bottom-3 left-3 font-semibold leading-tight mb-2">
                    {a.title}
                  </p>

                  <p className="absolute bottom-3 right-3 text-xs opacity-70">
                    {a.progress}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <button className="w-full rounded-2xl bg-gradient-to-l from-[#3B117A] to-[#4D2FA7] p-10 text-white font-semibold flex items-center justify-between text-2xl">
            Add New Project
            <span className="w-8 h-8 rounded-full border-2 border-[#F9B71E] flex items-center justify-center">
              <ChevronRight className="text-[#F9B71E]" size={20} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
