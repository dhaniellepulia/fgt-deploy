//// Dashboard > Store menu
import React, { useState } from "react";
import StoreCard from "../components/StoreCard.jsx";
import { ChevronDown } from "lucide-react";
import TopBar from "../components/layouts/TopBar.jsx";

function Store() {
  const [openGift, setOpenGift] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openAmount, setOpenAmount] = useState(false);
  const [openCurrency, setOpenCurrency] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const [selectedGift, setSelectedGift] = useState("All");
  const [country, setCountry] = useState("All");
  const [amountRange, setAmountRange] = useState("All");
  const [currency, setCurrency] = useState("All");
  const [status, setStatus] = useState("All");

  //Mock data for gift cards
  const giftcard = [
    {
      id: 1,
      title: "$5 Amazon.com - Gift Card",
      amount: 1000,
      country: "USA",
      currency: "USD",
      status: "Available",
    },
    {
      id: 2,
      title: "1720 Minecraft Minecoins",
      amount: 6367,
      country: "Philippines",
      currency: "PHP",
      status: "Available",
    },
    {
      id: 3,
      title: "$10 Amazon.com - Gift Card",
      amount: 10000,
      country: "Japan",
      currency: "JPY",
      status: "Delayed",
    },
    {
      id: 4,
      title: "EA Play - 1 Year",
      amount: 10000,
      country: "Australia",
      currency: "AUD",
      status: "Out of Stock",
    },
  ];

  const isAmountInRange = (amount) => {
    if (amountRange === "All") return true;
    if (amountRange === "0 - 5,000") return amount <= 5000;
    if (amountRange === "5,001 - 10,000")
      return amount > 5000 && amount <= 10000;
    if (amountRange === "10,001+") return amount > 10000;
    return true;
  };

  const filteredGiftCard = giftcard.filter((g) => {
    return (
      (country === "All" || g.country === country) &&
      (currency === "All" || g.currency === currency) &&
      (status === "All" || g.status === status) &&
      isAmountInRange(g.amount)
    );
  });

  return (
    <div className=" text-white">
      <header className="flex w-full items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] font-bold text-2xl">Store</h3>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-[#F9B71E] font-bold">Balance</span>
            <img src="../src/assets/coin.svg" alt="" />
            <span>5000</span>
          </div>
          <TopBar />
        </div>
      </header>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Country */}
        <div className="relative w-56">
          <button
            onClick={() => setOpenCountry(!openCountry)}
            className="flex items-center justify-between w-full gap-2 p-3 rounded bg-[#252525]"
          >
            <span className="text-sm truncate">{country}</span>
            <ChevronDown
              size={16}
              className={`text-[#F9B71E] transition-transform ${
                openCountry ? "rotate-180" : ""
              }`}
            />
          </button>

          {openCountry && (
            <div className="absolute mt-2 w-full bg-white text-black rounded-md shadow z-10">
              {["All", "USA", "Philippines", "Japan", "Australia"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCountry(c);
                    setOpenCountry(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="relative w-56">
          <button
            onClick={() => setOpenAmount(!openAmount)}
            className="flex items-center justify-between w-full gap-2 p-3 rounded bg-[#252525]"
          >
            <span className="text-sm truncate">{amountRange}</span>
            <ChevronDown
              size={16}
              className={`text-[#F9B71E] transition-transform ${
                openAmount ? "rotate-180" : ""
              }`}
            />
          </button>

          {openAmount && (
            <div className="absolute mt-2 w-full bg-white text-black rounded-md shadow z-10">
              {["All", "0 - 5,000", "5,001 - 10,000", "10,001+"].map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAmountRange(a);
                    setOpenAmount(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency */}
        <div className="relative w-56">
          <button
            onClick={() => setOpenCurrency(!openCurrency)}
            className="flex items-center justify-between w-full gap-2 p-3 rounded bg-[#252525]"
          >
            <span className="text-sm truncate">{currency}</span>
            <ChevronDown
              size={16}
              className={`text-[#F9B71E] transition-transform ${
                openCurrency ? "rotate-180" : ""
              }`}
            />
          </button>

          {openCurrency && (
            <div className="absolute mt-2 w-full bg-white text-black rounded-md shadow z-10">
              {["All", "USD", "PHP", "JPY", "AUD"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    setOpenCurrency(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="relative w-56">
          <button
            onClick={() => setOpenStatus(!openStatus)}
            className="flex items-center justify-between w-full gap-2 p-3 rounded bg-[#252525]"
          >
            <span className="text-sm truncate">{status}</span>
            <ChevronDown
              size={16}
              className={`text-[#F9B71E] transition-transform ${
                openStatus ? "rotate-180" : ""
              }`}
            />
          </button>

          {openStatus && (
            <div className="absolute mt-2 w-full bg-white text-black rounded-md shadow z-10">
              {["All", "Available", "Delayed", "Out of Stock"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setOpenStatus(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      {filteredGiftCard.length > 0 ? (
        <div className="grid bg-[#252525] p-8 rounded-xl grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredGiftCard.map((g) => (
            <StoreCard key={g.id} giftcard={g} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">No items found.</p>
      )}
    </div>
  );
}

export default Store;
