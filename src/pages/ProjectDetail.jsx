//Dashboard > Project > Project Details
import { useParams, useNavigate } from "react-router-dom";
import { mockProjects } from "../api/project.mock.js";
import TopBar from "../components/layouts/TopBar.jsx";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = mockProjects.find((p) => p.id === Number(id)) || {
    title: "SuperTuxKart",
    description:
      "Karts. Nitro. Action! SuperTuxKart is a 3D open-source arcade racer with a variety of characters, tracks, and modes to play.",
    version: "1.4",
    platform: "Mac",
  };

  const details = [
    { label: "DURATION", value: "5 minutes" },
    { label: "EXPECTED SESSIONS", value: "5 minutes" },
    { label: "FEATURES", value: "5 minutes" },
    { label: "LANGUAGES", value: "5 minutes" },
    { label: "SURVEY", value: "5 minutes" },
  ];

  return (
    <div className="min-h-screen text-gray-300  ">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-white text-2xl">
            Projects <span className="text-[#F9B71E]">{" > "} </span>
            SuperTuxKart
          </h3>
        </div>
        <TopBar />
      </header>
      <div className=" grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-8 mb-8">
            <button className="pb-4 text-[#F9B71E] border-b-2 border-[#F9B71E] font-semibold">
              Overview
            </button>
            <button className="pb-4 text-gray-500 hover:text-white transition font-semibold">
              Sessions
            </button>
          </div>
          <div className=" bg-[#252525] rounded-2xl p-8">
            <section className="mb-10 ">
              <h2 className="text-xl font-bold text-white mb-6">
                Project Description
              </h2>
              <div className="space-y-2">
                {details.map((item, index) => (
                  <div
                    key={index}
                    className="flex border border-gray-600 rounded-md overflow-hidden"
                  >
                    <div className="w-1/3 bg-[#2a2a2a] px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="w-2/3 bg-[#1e1e1e] px-4 py-3 text-sm text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-6">Evolution</h2>
              <div className="flex border border-gray-600 rounded-md overflow-hidden">
                <div className="w-1/3 bg-[#2a2a2a] px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  STATUS
                </div>
                <div className="w-2/3 bg-[#1e1e1e] px-4 py-3 text-sm text-white">
                  5 minutes
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar Card */}
        <div className="bg-[#252525] rounded-2xl p-8 flex flex-col h-fit">
          <h3 className="text-2xl font-bold text-white mb-4">
            {project.title}
          </h3>

          {/* Placeholder for Image */}
          <div className="aspect-square bg-[#333333] border border-gray-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gray-600 rotate-45"></div>
              <div className="w-full h-px bg-gray-600 -rotate-45"></div>
            </div>
          </div>

          <div className="text-xs text-orange-400 mb-6 flex items-center gap-2">
            <span>Version {project.version}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-white"></span> {project.platform}
            </span>
          </div>

          <div className="text-sm leading-relaxed text-gray-400 mb-6">
            <p className="mb-4">{project.description}</p>
            <p>
              Our aim is to create a game that is more fun than realistic, and
              provide an enjoyable experience for all ages.
            </p>
            <p className="mt-4 break-all text-gray-500">
              More on:{" "}
              <span className="underline cursor-pointer">
                https://supertuxkart.net/
              </span>
            </p>
          </div>

          <button
            onClick={() => navigate(`/projects/${id}/test`)}
            className="mt-auto w-full bg-[#4c28a5] hover:bg-[#5d35c2] text-white py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg"
          >
            Start Playtest
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
