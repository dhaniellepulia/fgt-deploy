import React from "react";
import { Clock, Star } from "lucide-react";
function GameCard({ game }) {
  return (
    <div className="bg-[#252525] rounded-xl overflow-hidden group cursor-pointer hover:ring-2 hover:ring-yellow-500 transition-all">
      {/* Placeholder Image Area */}
      <div className="aspect-square bg-neutral-600 relative flex items-center justify-center">
        <div className="absolute inset-0 border border-neutral-500/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-neutral-500/30 rotate-45" />
            <div className="w-full h-px bg-neutral-500/30 -rotate-45" />
          </div>
        </div>
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Content */}
      <div className="p-4 bg-[#323232]">
        <h3 className="text-white font-bold leading-tight mb-4 h-10 line-clamp-2">
          {game.title}
        </h3>

        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1 text-yellow-500/80">
            <Clock size={14} />
            <span>{game.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={14} fill="currentColor" />
            <span>{game.xp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCard;
