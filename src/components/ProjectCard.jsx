import React from "react";
import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-[#323232] rounded-lg hover:bg-neutral-750 transition cursor-pointer"
    >
      <div className="aspect-video bg-neutral-300 rounded-t-md mb-3 flex items-center justify-center">
        <span className="text-neutral-500 text-xs">Image</span>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight mb-2">
          {project.title}
        </h3>

        <div className="flex justify-between gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <img src="/src/assets/time.svg" alt="" /> {project.duration}'
          </span>
          <span className="flex items-center gap-1">⭐ {project.xp} XP</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
