import React from "react";
import { useNavigate } from "react-router-dom";

function ProjectCard({
  project,
  actionLabel,
  onAction,
  actionDisabled = false,
}) {
  const navigate = useNavigate();
  const isPlaytesterProject =
    typeof project.publishedQuestionnaireCount === "number";
  const metaLeft = isPlaytesterProject
    ? `${project.availableQuestionnaireCount ?? 0} available`
    : `${project.durationMinutes ?? "N/A"}'`;
  const metaRight = isPlaytesterProject
    ? `${project.publishedQuestionnaireCount} published`
    : project.projectTitle
      ? project.projectTitle
      : null;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-[#323232] rounded-lg hover:bg-neutral-750 transition cursor-pointer"
    >
      <div className="aspect-video bg-neutral-300 rounded-t-md mb-3 flex items-center justify-center">
        <span className="text-neutral-500 text-xs">Image</span>
      </div>

      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold leading-tight">{project.title}</h3>

        <div className="flex justify-between gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <img src="/src/assets/time.svg" alt="" /> {metaLeft}
          </span>
          {metaRight && <span className="truncate">{metaRight}</span>}
        </div>

        {actionLabel && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onAction?.();
            }}
            disabled={actionDisabled}
            className="w-full mt-2 bg-yellow-400 text-black text-xs font-semibold py-2 rounded disabled:opacity-60"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;
