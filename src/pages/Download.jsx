//Download Page
import React from "react";
import DownloadCard from "../components/DownloadCard.jsx";
import NavBar from "../components/ExternalNavBar.jsx";

const DOWNLOADS_DATA = [
  {
    id: 1,
    platform: "Windows",
    description: "For Windows and browser games.",
    version: "v1.21.2",
    size: "548MB",
    icon: (
      <img
        src="./src/assets/windows.png"
        alt="Windows Icon"
        className="w-12 h-12 text-yellow-500"
      />
    ),
  },
  {
    id: 2,
    platform: "macOS",
    description: "For macOS and browser games.",
    version: "v1.21.2",
    size: "548MB",
    icon: (
      <img
        src="./src/assets/icon apple 2.png"
        alt="Windows Icon"
        className="w-12 h-12 text-yellow-500"
      />
    ),
  },
  {
    id: 3,
    platform: "iOS",
    description: "For iPhone and iPad games.",
    version: "v1.21.2",
    size: "548MB",
    icon: (
      <img
        src="./src/assets/icon apple 2.png"
        alt="Windows Icon"
        className="w-12 h-12 text-yellow-500"
      />
    ),
  },
  {
    id: 4,
    platform: "macOS (Alt)",
    description: "Legacy support for older builds.",
    version: "v1.21.2",
    size: "548MB",
    icon: (
      <img
        src="./src/assets/icon apple 2.png"
        alt="Windows Icon"
        className="w-12 h-12 text-yellow-500"
      />
    ),
  },
  {
    id: 5,
    platform: "Android",
    description: "For Android mobile and tablets.",
    version: "v1.21.2",
    size: "548MB",
    icon: (
      <img
        src="./src/assets/android 1.png"
        alt="Windows Icon"
        className="w-12 h-12 text-yellow-500"
      />
    ),
  },
];

const Download = () => {
  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <header className="mb-0">
        <div className="bg-[#4152B3] text-white">
          <NavBar />
        </div>
      </header>
      <div className="max-w-7xl mx-auto py-20 px-5">
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DOWNLOADS_DATA.map((item) => (
            <DownloadCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Download;
