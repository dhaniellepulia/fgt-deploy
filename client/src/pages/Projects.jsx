import React, { useEffect, useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import TopBar from "../components/layouts/TopBar.jsx";
import { fetchProjects, joinProject } from "../api/projects";
import { useAuth } from "../auth/AuthContext";
import {
  createClientProject,
  deleteClientProject,
  fetchClientProjects,
} from "../api/clientProjects";
import { useNavigate } from "react-router-dom";

const tabs = ["All", "Upcoming", "Active", "Past"];

const statusById = {
  1: "Upcoming",
  2: "Active",
  3: "Past",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const resolveImageUrlFromItem = (item) => {
  const url =
    item?.imageUrl ||
    item?.projectImageUrl ||
    item?.project?.projectImageUrl ||
    item?.project?.imageUrl ||
    item?.projectImageUrl ||
    "";
  if (!url) return null;
  return url.startsWith("/") ? `${API_BASE}${url}` : url;
};

function mapClientProjectsToItems(projects) {
  return projects.flatMap((project) => {
    const questionnaires = project.questionnaires || [];
    return questionnaires.map((q) => ({
      id: q.questionnaireID,
      title: q.title,
      description: q.description,
      status: statusById[q.statusID] || "Active",
      durationMinutes: q.timeLimitSeconds
        ? Math.ceil(q.timeLimitSeconds / 60)
        : null,
      startsAt: q.startsAt,
      endsAt: q.endsAt,
      projectTitle: project.title,
    }));
  });
}

function Projects() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [projects, setProjects] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [joiningProjectID, setJoiningProjectID] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    gameTitle: "",
    gameGenre: "",
    gamePlatforms: "",
    gameVersion: "",
    gameNotes: "",
  });

  useEffect(() => {
    let mounted = true;
    const roleID = user?.roleID?.toString();
    const isClientUser = roleID === "3" || roleID === "1";

    async function load() {
      try {
        setLoading(true);
        if (isClientUser) {
          const res = await fetchClientProjects(token);
          if (mounted) {
            setClientProjects(res.items || []);
            setProjects(mapClientProjectsToItems(res.items || []));
            setError("");
          }
        } else {
          const res = await fetchProjects(token);
          if (mounted) {
            setProjects(res.items || []);
            setError("");
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load projects");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (token) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [token, user]);

  const filteredProjects = useMemo(() => {
    if (activeTab === "All") return projects;
    return projects.filter((p) => p.status === activeTab);
  }, [activeTab, projects]);

  const handleProjectInput = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async () => {
    if (!projectForm.title) return;
    try {
      setSaving(true);
      const res = await createClientProject(token, projectForm);
      const updated = [res.item, ...clientProjects];
      setClientProjects(updated);
      setProjects(mapClientProjectsToItems(updated));
      setProjectForm({
        title: "",
        description: "",
        gameTitle: "",
        gameGenre: "",
        gamePlatforms: "",
        gameVersion: "",
        gameNotes: "",
      });
    } catch (err) {
      alert(err.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectID) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteClientProject(projectID, token);
      const updated = clientProjects.filter((p) => p.projectID !== projectID);
      setClientProjects(updated);
      setProjects(mapClientProjectsToItems(updated));
    } catch (err) {
      alert(err.message || "Failed to delete project");
    }
  };

  const handleJoinProject = async (projectID) => {
    try {
      setJoiningProjectID(projectID);
      await joinProject(projectID, token);
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectID ? { ...project, isJoined: true } : project,
        ),
      );
    } catch (err) {
      alert(err.message || "Failed to join project");
    } finally {
      setJoiningProjectID(null);
    }
  };

  const roleID = user?.roleID?.toString();
  const isClientUser = roleID === "3" || roleID === "1";

  return (
    <div className=" text-white">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] text-2xl font-bold">Projects</h3>
        </div>
        <TopBar />
      </header>

      {isClientUser && (
        <div className="bg-[#252525] rounded-xl p-6 mb-8">
          <h4 className="text-lg font-semibold mb-4">Create New Project</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              value={projectForm.title}
              onChange={handleProjectInput}
              placeholder="Project title"
              className="bg-white text-black rounded p-2"
            />
            <input
              name="gameTitle"
              value={projectForm.gameTitle}
              onChange={handleProjectInput}
              placeholder="Game title"
              className="bg-white text-black rounded p-2"
            />
            <input
              name="gameGenre"
              value={projectForm.gameGenre}
              onChange={handleProjectInput}
              placeholder="Game genre"
              className="bg-white text-black rounded p-2"
            />
            <input
              name="gamePlatforms"
              value={projectForm.gamePlatforms}
              onChange={handleProjectInput}
              placeholder="Platforms (PC/Console/Mobile)"
              className="bg-white text-black rounded p-2"
            />
            <input
              name="gameVersion"
              value={projectForm.gameVersion}
              onChange={handleProjectInput}
              placeholder="Game version"
              className="bg-white text-black rounded p-2"
            />
            <textarea
              name="description"
              value={projectForm.description}
              onChange={handleProjectInput}
              placeholder="Project description"
              className="bg-white text-black rounded p-2 md:col-span-2"
            />
            <textarea
              name="gameNotes"
              value={projectForm.gameNotes}
              onChange={handleProjectInput}
              placeholder="Game notes"
              className="bg-white text-black rounded p-2 md:col-span-2"
            />
          </div>
          <div className="mt-4">
            <button
              onClick={handleCreateProject}
              disabled={saving}
              className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Project"}
            </button>
          </div>
        </div>
      )}

      {isClientUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {clientProjects.map((project) => (
            <div
              key={project.projectID}
              className="bg-[#252525] rounded-xl p-5 border border-neutral-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{project.title}</h4>
                  <p className="text-xs text-neutral-400">
                    {project.gameTitle || "Game"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.projectID)}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                {project.description || "No description"}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-neutral-500">
                  {project.questionnaires?.length || 0} questionnaires
                </span>
                <button
                  onClick={() =>
                    navigate(`/client/projects/${project.projectID}`)
                  }
                  className="text-sm text-yellow-400"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isClientUser && (
        <>
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

          {loading ? (
            <p className="text-sm text-neutral-400">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : filteredProjects.length > 0 ? (
            <div className="grid h-full bg-[#252525] p-8 rounded-xl grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => {
                // const actionLabel = project.isJoined
                //   ? "Joined"
                //   : "Apply to Join";
                const imageSrc = resolveImageUrlFromItem(project);
                const projectWithImage = { ...project, imageUrl: imageSrc };
                return (
                  <ProjectCard
                    key={project.id}
                    project={projectWithImage}
                    // actionLabel={actionLabel}
                    // actionDisabled={
                    //   project.isJoined || joiningProjectID === project.id
                    // }
                    // onAction={() => handleJoinProject(project.id)}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No items found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Projects;
