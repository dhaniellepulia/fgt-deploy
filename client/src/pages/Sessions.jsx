import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/layouts/TopBar.jsx";
import { useAuth } from "../auth/AuthContext";
import Coin from "../assets/coin.svg";
import Time from "../assets/time.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function fmtDuration(start, end) {
  if (!start) return "-";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  if (isNaN(s) || isNaN(e)) return "-";
  const diffSec = Math.max(0, Math.floor((e - s) / 1000));
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${mins}m ${secs}s`;
}

export default function Sessions() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolveImage = (item) => {
    const url =
      item?.project?.projectImageUrl ||
      item?.projectImageUrl ||
      item?.imageUrl ||
      "";
    if (!url) return null;
    return url.startsWith("/") ? `${API_BASE}${url}` : url;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
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
      } catch (err) {
        console.error("load sessions error", err);
        if (mounted) setError("Failed to load sessions");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="text-white">
      <header className="flex w-full items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] font-bold text-2xl">Sessions</h3>
        </div>
        <TopBar />
      </header>

      {loading ? (
        <p className="text-sm text-neutral-400">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-neutral-400">No sessions found.</p>
      ) : (
        <div className="grid h-full bg-[#252525] p-8 rounded-xl grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {sessions.map((s, i) => {
            const projectTitle = s.project?.title || "Untitled";
            const questionnaireTitle = s.questionnaire?.title || "Survey";
            const startedAt = s.startedAt;
            const endedAt = s.submittedAt;
            const points = s.pointsReward ?? s.questionnaire?.pointsReward ?? 0;
            const duration = fmtDuration(startedAt, endedAt);
            const imageSrc = resolveImage(s);

            return (
              <div
                key={s.id ?? i}
                className="bg-[#323232] rounded-lg overflow-hidden relative"
                role="group"
              >
                <div
                  className="w-full max-h-75 bg-neutral-300 flex items-center justify-center"
                  style={{ aspectRatio: "3 / 5" }}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={projectTitle}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-neutral-500 text-xs">No image</div>
                  )}
                </div>

                {s.submittedAt && (
                  <div className="absolute top-2 right-2 bg-green-600 rounded-full w-7 h-7 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 6L9 17l-5-5"
                      />
                    </svg>
                  </div>
                )}

                <div className="p-4">
                  <div className="text-sm font-semibold text-white truncate">
                    {questionnaireTitle}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 truncate">
                    {projectTitle}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-1">
                      <img src={Time} alt="Duration" className="w-4 h-4" />
                      <div className="text-white font-semibold">{duration}</div>
                    </div>
                    <div className="text-right flex items-center gap-1 justify-end">
                      <img src={Coin} alt="Points" className="w-4 h-4" />
                      <div className="text-white font-semibold">{points}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
