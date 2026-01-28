// Dashboard > Sessions menu
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ProjectCard from "../components/ProjectCard.jsx";
import TopBar from "../components/layouts/TopBar.jsx";

function Sessions() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All");

  // Mock data for sessions
  const projects = [
    {
      id: 1,
      title: "1720 Minecraft Minecoins",
      duration: 5,
      xp: 15,
      status: "Active",
    },
    {
      id: 2,
      title: "1720 Minecraft Minecoins",
      duration: 5,
      xp: 15,
      status: "Upcoming",
    },
    {
      id: 3,
      title: "1720 Minecraft Minecoins",
      duration: 5,
      xp: 15,
      status: "Past",
    },
    {
      id: 4,
      title: "test",
      duration: 5,
      xp: 15,
      status: "Past",
    },
  ];

  const handleSelect = (value) => {
    setSelected(value);
    setOpen(false);
  };

  const filteredProjects =
    selected === "All"
      ? projects
      : projects.filter((p) => p.title === selected);

  return (
    <div className=" text-white">
      <header className="flex w-full items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] font-bold text-2xl">Sessions</h3>
        </div>
        <TopBar />
      </header>
      <div className="mb-6">
        <div className="relative text-left w-56">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center justify-between w-full gap-2 p-3 rounded bg-[#252525]"
          >
            <span className="text-sm truncate">{selected}</span>
            <ChevronDown
              size={16}
              className={`text-[#F9B71E] transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 bg-white text-black border rounded-md shadow z-10">
              {/* All option */}
              <button
                onClick={() => handleSelect("All")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                All
              </button>

              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project.title)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {project.title}
                </button>
              ))}
            </div>
          )}
        </div>
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

export default Sessions;
