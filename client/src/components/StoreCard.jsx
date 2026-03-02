import React from "react";
import Coin from "../assets/coin.svg";

function StoreCard({ giftcard }) {
  return (
    <div className="bg-[#323232] rounded-lg hover:bg-neutral-750 transition">
      <div className="aspect-video bg-neutral-300 rounded-t-md mb-3 flex items-center justify-center">
        <span className="text-neutral-500 text-xs">Image</span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight mb-2">
          {giftcard.title}
        </h3>

        <div className="flex  gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <img src={Coin} alt="" /> {giftcard.amount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
