//page for Profile > Game Library
import React from "react";
import { ChevronDown, Search } from "lucide-react";
import GameCard from "../GameCard.jsx";

const gamesData = [
  {
    id: 1,
    title: "1720 Minecraft Minecoins",
    duration: "5'",
    xp: "15 XP",
    image: "https://via.placeholder.com/300x300",
  },
  {
    id: 2,
    title: "1720 Minecraft Minecoins",
    duration: "5'",
    xp: "15 XP",
    image: "https://via.placeholder.com/300x300",
  },
  {
    id: 3,
    title: "1720 Minecraft Minecoins",
    duration: "5'",
    xp: "15 XP",
    image: "https://via.placeholder.com/300x300",
  },
  {
    id: 4,
    title: "1720 Minecraft Minecoins",
    duration: "5'",
    xp: "15 XP",
    image: "https://via.placeholder.com/300x300",
  },
];

function GameLibrary() {
  return (
    <div className="space-y-8  rounded-2xl">
      {/* Top Connection Bar */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-4 bg-[#252525] p-3 rounded-xl border border-white/5 w-64">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"
            className="w-8 h-8"
            alt="steam"
          />
          <span className="text-white font-bold tracking-widest mr-auto">
            STEAM
          </span>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-md font-bold">
            Connect
          </button>
        </div>

        <div className="flex items-center gap-4 bg-[#252525] p-3 rounded-xl border border-white/5 w-64">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"
            className="w-8 h-8"
            alt="xbox"
          />
          <span className="text-white font-bold tracking-widest mr-auto">
            XBOX
          </span>
          <button className="bg-[#c3503d] hover:bg-red-500 text-white text-xs px-4 py-2 rounded-md font-bold">
            Disconnect
          </button>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="bg-[#252525] p-10 rounded-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Your Games</h2>
            <span className="text-xs text-yellow-500/60 uppercase tracking-tighter">
              Last updated: 1:37PM 01/01/2026
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dropdowns */}
            <div className="relative">
              <select className="appearance-none bg-[#252525] text-neutral-400 text-sm px-4 py-2 pr-10 rounded-lg border border-white/10 outline-none focus:ring-1 focus:ring-yellow-500">
                <option>Sort</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3 text-yellow-500"
              />
            </div>

            <div className="relative">
              <select className="appearance-none bg-[#252525] text-neutral-400 text-sm px-4 py-2 pr-10 rounded-lg border border-white/10 outline-none focus:ring-1 focus:ring-yellow-500">
                <option>Filter</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3 text-yellow-500"
              />
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="bg-[#252525] text-white text-sm px-4 py-2 pr-10 rounded-lg border border-white/10 outline-none focus:ring-1 focus:ring-yellow-500 lg:w-64"
              />
              <Search
                size={16}
                className="absolute right-3 top-2.5 text-yellow-500"
              />
            </div>
          </div>
        </div>
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {gamesData.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameLibrary;
