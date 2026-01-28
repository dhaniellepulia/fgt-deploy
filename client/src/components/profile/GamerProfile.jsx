//page for Profile > Gamer Profile
import React from "react";
import StatCard from "../StatCard.jsx";

const stats = [
  { id: 1, label: "Coins", value: "5000" },
  { id: 2, label: "Playtests", value: "1" },
  { id: 3, label: "Sessions", value: "1" },
  { id: 4, label: "Background", value: "midcore" },
  { id: 5, label: "Time Played", value: "00:06:56" },
];

function GamerProfile() {
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
            src="../src/assets/avatar.png"
            alt="avatar"
            className="w-30 h-30 rounded-full bg-cyan-400"
          />
          <div className="flex flex-col justify-center items-center">
            <p className="text-white font-semibold">Dhan</p>
            <p className="text-sm text-neutral-400">@heisenberg24</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <section className="rounded-xl bg-[#252525] p-6 min-h-[180px]">
        <h2 className="text-white font-semibold mb-3">
          Your Gamer Motivations
        </h2>
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
