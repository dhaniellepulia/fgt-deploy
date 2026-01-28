//page for Profile > My Game Library

import React from "react";

// Mock data for reward history
const rewardHistoryData = [
  {
    id: 1,
    assignedAt: "1/1/26 11:39 AM",
    source: "[Tutorial] Complete you Gamer Profile",
    sessions: 1,
    xp: 51,
    coins: 5000,
  },
  {
    id: 2,
    assignedAt: "1/1/26 11:39 AM",
    source: "[Tutorial] Complete you Gamer Profile",
    sessions: 1,
    xp: 51,
    coins: 5000,
  },
  {
    id: 3,
    assignedAt: "1/1/26 11:39 AM",
    source: "[Tutorial] Complete you Gamer Profile",
    sessions: 1,
    xp: 51,
    coins: 5000,
  },
  {
    id: 4,
    assignedAt: "1/1/26 11:39 AM",
    source: "[Tutorial] Complete you Gamer Profile",
    sessions: 1,
    xp: 51,
    coins: 5000,
  },
];

function RewardHistory() {
  return (
    <div className="rounded-xl bg-[#252525] p-6">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_4fr_1fr_1fr_1fr] gap-4 px-4 text-xs font-medium text-neutral-400">
        <div>ASSIGNATION DATE</div>
        <div>SOURCE</div>
        <div className="text-center">SESSIONS</div>
        <div className="text-center">XP</div>
        <div className="text-right">COINS</div>
      </div>

      {/* Rows */}
      <div className="mt-3 space-y-2">
        {rewardHistoryData.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[2fr_4fr_1fr_1fr_1fr] gap-4 items-center rounded border
            border-[#ffffff49] bg-[#1F1F1F]text-sm text-white"
          >
            <div className="text-neutral-300 p-3 border-r border-[#ffffff49] bg-[#323232]">
              {item.assignedAt}
            </div>

            <div className="truncate p-3">{item.source}</div>

            <div className="text-center p-3">{item.sessions}</div>

            <div className="text-center p-3">{item.xp}</div>

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
      </div>
    </div>
  );
}

export default RewardHistory;
