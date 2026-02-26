import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return "-";
  return dt.toLocaleString();
}

function RewardHistory() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const rRes = await fetch(
          `${API_BASE}/questionnaire-responses/me?status=all`,
          { headers },
        );
        if (!rRes.ok) {
          console.debug("questionnaire-responses/me failed", rRes.status);
          if (mounted) setRows([]);
          return;
        }
        const j = await rRes.json();
        const responses = Array.isArray(j.items)
          ? j.items
          : j.items
            ? [j.items]
            : [];

        const items = responses
          .filter((r) => r.submittedAt || Number(r.responseStatusID) === 2)
          .map((r) => {
            const assignedAt = r.submittedAt ?? r.startedAt;
            const projectTitle =
              r.questionnaire?.project?.title ??
              r.project?.title ??
              r.questionnaire?.title ??
              "Playtest";
            const coins = Number(
              r.questionnaire?.pointsReward ?? r.pointsAwarded ?? r.points ?? 0,
            );
            return {
              id: String(r.questionnaireResponseID ?? r.id ?? Math.random()),
              assignedAt,
              source: projectTitle,
              coins,
            };
          })
          .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

        if (mounted) setRows(items);
      } catch (e) {
        console.error("load reward history failed", e);
        if (mounted) setRows([]);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="rounded-xl bg-[#252525] p-6">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_4fr_1fr] gap-4 px-4 text-xs font-medium text-neutral-400">
        <div> DATE</div>
        <div>SOURCE</div>
        <div className="text-right">COINS</div>
      </div>

      {/* Rows */}
      <div className="mt-3 space-y-2">
        {rows.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[2fr_4fr_1fr] gap-4 items-center rounded border border-[#ffffff49] bg-[#1F1F1F] text-sm text-white"
          >
            <div className="text-neutral-300 p-3 border-r border-[#ffffff49] bg-[#323232]">
              {fmtDate(item.assignedAt)}
            </div>

            <div className="truncate p-3">{item.source}</div>

            <div className="flex items-center justify-end gap-2 p-3">
              <span>
                <img
                  src="../src/assets/coin.svg"
                  alt="Coin"
                  className="w-4 h-4"
                />
              </span>
              <span>{item.coins}</span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-sm text-neutral-400 p-4">
            No reward history found.
          </div>
        )}
      </div>
    </div>
  );
}

export default RewardHistory;
