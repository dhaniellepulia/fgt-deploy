import React from "react";

function StatCard({ stat }) {
  return (
    // <div
    //   className={`rounded-xl px-5 py-4 border ${
    //     highlight
    //       ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
    //       : "border-neutral-700 bg-neutral-900 text-white"
    //   }`}
    // >
    //   <p className="text-xs text-neutral-400">{stat.label}</p>
    //   <p className="text-lg font-semibold">{value}</p>
    // </div>
    <div
      className={
        "rounded-xl px-8 py-4 border border-[#ffffff54] text-white flex flex-col items-center justify-center gap-2"
      }
    >
      <p className="text-xs text-neutral-400">{stat.label}</p>
      <p className="text-2xl font-semibold">{stat.value}</p>
    </div>
  );
}

export default StatCard;
