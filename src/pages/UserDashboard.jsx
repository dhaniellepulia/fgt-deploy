// Dashboard > User Dashboard menu

import React from "react";
import Card from "../components/Card.jsx";
import { ChevronRight } from "lucide-react";
import TopBar from "../components/layouts/TopBar.jsx";
function UserDashboard() {
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap-reverse items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] text-2xl">
            Welcome, <strong>heisenberg24!</strong>
          </h3>
        </div>
        <TopBar />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Last Sessions" action>
            <ul className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-neutral-700" />
                    <div>
                      <p className="text-white text-md">Project Name Text</p>
                      <p className="text-xs text-neutral-400">
                        Yesterday, 2:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-md">00.06.56</p>
                    <p className="text-xs text-neutral-400">Duration</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="My Projects" action>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-neutral-700" />
                  <div>
                    <p className="text-white text-md">Project Name Text</p>
                    <p className="text-xs text-[#8CFF82]">Completed</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white text-md">00.06.56</p>
                  <p className="text-xs text-neutral-400">Duration</p>
                </div>
              </li>

              <li className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-neutral-700" />
                  <div>
                    <p className="text-white text-md">Project Name Text</p>
                    <p className="text-xs text-[#8CFF82]">Completed</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white text-md">00.06.56</p>
                  <p className="text-xs text-neutral-400">Duration</p>
                </div>
              </li>

              <li className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-neutral-700" />
                  <div>
                    <p className="text-white text-md">Project Name Text</p>
                    <p className="text-xs text-yellow-400">In Progress</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white text-md">00.06.56</p>
                  <p className="text-xs text-neutral-400">Duration</p>
                </div>
              </li>
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
                  src="../src/assets/discord logo.png"
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
                <p className="text-lg font-medium">1</p>
              </div>
              <div>
                <p className="opacity-70 mb-2">SESSIONS</p>
                <p className="text-lg font-medium">1</p>
              </div>
              <div>
                <p className="opacity-70 mb-2">COINS</p>
                <p className="text-lg font-medium">0</p>
              </div>
            </div>
          </div>

          <Card
            title="Achievements"
            action={
              <span className="text-yellow-400 font-bold text-2xl">
                <span className="text-white">1</span>/6
              </span>
            }
          >
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => {
                const completed = i === 1;

                return (
                  <div
                    key={i}
                    className={`
            relative h-28 rounded-2xl p-4
            text-white text-sm
            shadow-md
            ${completed ? "bg-[#4152B3]" : "bg-neutral-800"}
          `}
                  >
                    {completed && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-400 text-[#4152B3] flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}

                    <p className="absolute bottom-3 left-3 font-semibold leading-tight mb-2">
                      Create your
                      <br />
                      account
                    </p>

                    <p className="absolute bottom-3 right-3 text-xs opacity-70">
                      1/1
                    </p>
                  </div>
                );
              })}
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
