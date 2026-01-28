// Dashboard > Project menu
import React from "react";
import { useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import TopBar from "../components/layouts/TopBar.jsx";
import { mockProjects as projects } from "../api/project.mock.js";

const tabs = ["All", "Upcoming", "Active", "Past"];
function Projects() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredProjects =
    activeTab === "All"
      ? projects
      : projects.filter((p) => p.status === activeTab);

  return (
    <div className=" text-white">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] text-2xl font-bold">Projects</h3>
        </div>
        <TopBar />
      </header>
      <div className="flex gap-15 mb-6 mx-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-sm font-bold transition
              ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-neutral-400 hover:text-white"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid h-full bg-[#252525] p-8 rounded-xl grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">No items found.</p>
      )}
    </div>
  );
}

export default Projects;
