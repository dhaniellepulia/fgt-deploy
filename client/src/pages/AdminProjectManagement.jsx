//Changes get saved only in state
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "../components/layouts/TopBar";
import OverlayModal from "../components/OverlayModal";

const initialProjects = [
  {
    projectID: 101,
    title: "Sample 1",
    clientName: "Sample Client",
    status: "Pending",
    createdAt: new Date("2026-01-05T10:00:00Z"),
    genres: ["Racing", "Sci-fi"],
    description: "Sample Description",
    criteria: ["Age 18+", "Plays racing games", "PC players"],
    gameTitle: "Space Racer",
    gameGenre: "Racing",
    gamePlatforms: ["PC"],
    gameVersion: "0.9.1",
    gameNotes: "Sample Notes",
    image: null,
    questionnaires: [
      {
        questionnaireID: 201,
        title: "Sample Question",
        description: "Sample question description",
        statusID: 2,
        publishedAt: null,
        startsAt: new Date("2026-02-10T00:00:00Z"),
        endsAt: new Date("2026-02-24T00:00:00Z"),
        timeLimitSeconds: 600,
        maxResponses: 500,
        pointsReward: 50,
        createdAt: new Date("2026-01-10T08:00:00Z"),
        questions: [
          {
            id: "q1",
            text: "How did you find the handling?",
            type: "single",
            points: 10,
            options: ["Too floaty", "Just right", "Too tight"],
          },
        ],
      },
    ],
  },
  {
    projectID: 102,
    title: "Sample Game 2",
    clientName: "Sample Client 2",
    status: "Active",
    createdAt: new Date("2025-12-12T14:30:00Z"),
    genres: ["RPG", "Adventure"],
    description: "Sample Description 2",
    criteria: ["Age 16+", "Likes RPGs", "Comfortable writing feedback"],
    gameTitle: "Mystic Quest",
    gameGenre: "RPG",
    gamePlatforms: ["PC", "Console"],
    gameVersion: "1.2.0",
    gameNotes: "Sample Notes 2",
    image: null,
    questionnaires: [
      {
        questionnaireID: 202,
        title: "Sample",
        description: "Sample",
        statusID: 2,
        publishedAt: new Date("2025-12-20T00:00:00Z"),
        startsAt: new Date("2025-12-20T00:00:00Z"),
        endsAt: new Date("2026-01-20T00:00:00Z"),
        timeLimitSeconds: 900,
        maxResponses: 300,
        pointsReward: 40,
        createdAt: new Date("2025-12-12T14:30:00Z"),
        questions: [],
      },
    ],
  },
  {
    projectID: 103,
    title: "Sample Game 3",
    clientName: "Sample Client 3",
    status: "Pending",
    createdAt: new Date("2026-01-20T09:15:00Z"),
    genres: ["Puzzle", "Casual"],
    description: "Sample Desciption",
    criteria: ["All ages", "Casual players", "Mobile players"],
    gameTitle: "Puzzle Garden",
    gameGenre: "Puzzle",
    gamePlatforms: ["Mobile"],
    gameVersion: "0.5.0",
    gameNotes: "",
    image: null,
    questionnaires: [],
  },
];

const fmt = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

export default function AdminProjectManagement() {
  const [projects, setProjects] = useState(initialProjects);
  const [sortBy, setSortBy] = useState("projectID"); // projectID | client | createdAt
  const [direction, setDirection] = useState("asc");
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);

  // new project modal state
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newGameTitle, setNewGameTitle] = useState("");
  const [newGameGenre, setNewGameGenre] = useState("");
  const [newGamePlatforms, setNewGamePlatforms] = useState("");
  const [newGameVersion, setNewGameVersion] = useState("");
  const [newGameNotes, setNewGameNotes] = useState("");
  const [newImage, setNewImage] = useState("");

  // questionnaire builder modal state inside project modal
  const [showAddQuestionnaire, setShowAddQuestionnaire] = useState(false);
  const [qTitle, setQTitle] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qPoints, setQPoints] = useState(0);
  const [qTimeLimit, setQTimeLimit] = useState("");
  const [qMaxResponses, setQMaxResponses] = useState("");
  const [qStartsAt, setQStartsAt] = useState("");
  const [qEndsAt, setQEndsAt] = useState("");
  const [qQuestions, setQQuestions] = useState([]);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState(false);
  const [editingQuestionnaireId, setEditingQuestionnaireId] = useState(null);

  const handleNewImageFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result);
    reader.readAsDataURL(f);
  };

  const handleEditImageFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditProject((p) => ({ ...(p || {}), image: reader.result }));
    reader.readAsDataURL(f);
  };

  const sorted = useMemo(() => {
    const arr = [...projects];
    const cmp = (a, b) => {
      if (sortBy === "projectID")
        return Number(a.projectID) - Number(b.projectID);
      if (sortBy === "client") return a.clientName.localeCompare(b.clientName);
      if (sortBy === "createdAt") {
        const da = (
          a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
        ).getTime();
        const db = (
          b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
        ).getTime();
        return da - db;
      }
      return 0;
    };
    arr.sort((a, b) => (direction === "asc" ? cmp(a, b) : -cmp(a, b)));
    return arr;
  }, [projects, sortBy, direction]);

  const openProject = (p) => {
    setSelectedProject(p);
    setEditProject({ ...p });
    // if project has a questionnaire, prefill builder state for quick edit when requested
    const existing = p.questionnaires?.[0] ?? null;
    if (existing) {
      setEditingQuestionnaire(false);
      setEditingQuestionnaireId(existing.questionnaireID);
    } else {
      setEditingQuestionnaireId(null);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
    setEditProject(null);
    setShowAddQuestionnaire(false);
    resetQuestionnaireBuilder();
    setEditingQuestionnaire(false);
    setEditingQuestionnaireId(null);
  };

  const openAddProject = () => {
    setNewProjectTitle("");
    setNewProjectClient("");
    setNewProjectDescription("");
    setNewGameTitle("");
    setNewGameGenre("");
    setNewGamePlatforms("");
    setNewGameVersion("");
    setNewGameNotes("");
    setNewImage("");
    setShowAddProject(true);
  };

  const createProject = () => {
    const nextID = Math.max(...projects.map((p) => p.projectID), 100) + 1;
    const newP = {
      projectID: nextID,
      title: newProjectTitle || `Untitled ${nextID}`,
      clientName: newProjectClient || "Unknown",
      status: "Pending",
      createdAt: new Date(),
      image: newImage || "",
      genres: newGameGenre ? [newGameGenre] : [],
      description: newProjectDescription || "",
      criteria: [],
      gameTitle: newGameTitle || "",
      gameGenre: newGameGenre || "",
      gamePlatforms: newGamePlatforms
        ? newGamePlatforms
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      gameVersion: newGameVersion || "",
      gameNotes: newGameNotes || "",
      questionnaires: [],
    };
    setProjects((prev) => [newP, ...prev]);
    setShowAddProject(false);
  };

  const saveProject = () => {
    if (!editProject) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.projectID === editProject.projectID ? { ...editProject } : p,
      ),
    );
    setSelectedProject({ ...editProject });
    setEditProject({ ...editProject });
    closeModal();
  };

  const openAddQuestionnaire = () => {
    // if questionnaire exists for selectedProject, open builder in edit mode
    const existing = selectedProject?.questionnaires?.[0] ?? null;
    if (existing) {
      loadQuestionnaireToBuilder(existing);
      setEditingQuestionnaire(true);
      setEditingQuestionnaireId(existing.questionnaireID);
    } else {
      resetQuestionnaireBuilder();
      setEditingQuestionnaire(false);
      setEditingQuestionnaireId(null);
    }
    setShowAddQuestionnaire(true);
  };

  function resetQuestionnaireBuilder() {
    setQTitle("");
    setQDesc("");
    setQPoints(0);
    setQTimeLimit("");
    setQMaxResponses("");
    setQStartsAt("");
    setQEndsAt("");
    setQQuestions([]);
    setEditingQuestionnaire(false);
    setEditingQuestionnaireId(null);
  }

  function loadQuestionnaireToBuilder(q) {
    setQTitle(q.title || "");
    setQDesc(q.description || "");
    setQPoints(q.pointsReward || 0);
    setQTimeLimit(q.timeLimitSeconds ?? "");
    setQMaxResponses(q.maxResponses ?? "");
    setQStartsAt(
      q.startsAt ? new Date(q.startsAt).toISOString().slice(0, 16) : "",
    );
    setQEndsAt(q.endsAt ? new Date(q.endsAt).toISOString().slice(0, 16) : "");
    setQQuestions((q.questions || []).map((qq) => ({ ...qq })));
  }

  // questionnaire builder helpers
  const addQuestion = () => {
    const q = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: "",
      type: "single", // 'single' | 'multiple' | 'text'
      points: 0,
      options: ["", ""],
    };
    setQQuestions((s) => [...s, q]);
  };

  const removeQuestion = (id) => {
    setQQuestions((s) => s.filter((q) => q.id !== id));
  };

  const updateQuestionField = (id, key, value) => {
    setQQuestions((s) =>
      s.map((q) => (q.id === id ? { ...q, [key]: value } : q)),
    );
  };

  const addOption = (qid) => {
    setQQuestions((s) =>
      s.map((q) =>
        q.id === qid ? { ...q, options: [...(q.options || []), ""] } : q,
      ),
    );
  };

  const updateOption = (qid, idx, value) => {
    setQQuestions((s) =>
      s.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === idx ? value : opt)),
            }
          : q,
      ),
    );
  };

  const removeOption = (qid, idx) => {
    setQQuestions((s) =>
      s.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.filter((_, i) => i !== idx) }
          : q,
      ),
    );
  };

  const createOrUpdateQuestionnaire = (projectID) => {
    const qNextID =
      Math.max(
        0,
        ...projects.flatMap(
          (p) => p.questionnaires?.map((q) => Number(q.questionnaireID)) || [],
        ),
      ) + 1;

    const preparedQuestions = qQuestions.map((q) => ({
      id: q.id,
      text: q.text || "Untitled question",
      type: q.type,
      points: Number(q.points) || 0,
      options: (q.options || []).filter(Boolean),
    }));

    const payload = {
      questionnaireID: editingQuestionnaireId ?? qNextID,
      title: qTitle || `Questionnaire ${editingQuestionnaireId ?? qNextID}`,
      description: qDesc || "",
      statusID: 1,
      publishedAt: null,
      startsAt: qStartsAt ? new Date(qStartsAt) : null,
      endsAt: qEndsAt ? new Date(qEndsAt) : null,
      timeLimitSeconds: qTimeLimit ? Number(qTimeLimit) : null,
      maxResponses: qMaxResponses ? Number(qMaxResponses) : null,
      pointsReward: Number(qPoints) || 0,
      createdAt: new Date(),
      questions: preparedQuestions,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.projectID === projectID
          ? { ...p, questionnaires: [payload] } // enforce single questionnaire per project
          : p,
      ),
    );

    // update selected/edit project to reflect new questionnaire
    if (editProject && editProject.projectID === projectID) {
      setEditProject((ep) => ({ ...(ep || {}), questionnaires: [payload] }));
      setSelectedProject((sp) => ({
        ...(sp || {}),
        questionnaires: [payload],
      }));
    }

    setShowAddQuestionnaire(false);
    resetQuestionnaireBuilder();
  };

  return (
    <div className="min-h-screen">
      <header className="flex w-full items-center justify-between py-15 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[#F9B71E] font-bold text-2xl">
            Project Management
          </h2>
          <button
            onClick={openAddProject}
            className="ml-2 bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded text-sm"
          >
            Add Project
          </button>
        </div>
        <TopBar />
      </header>

      <div className="rounded-xl bg-[#252525] p-8">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-white text-xl font-bold mb-8">Projects</h4>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300">Sort by</label>
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 pr-8 focus:border-gray-600 focus:outline-0"
              >
                <option value="projectID">Project ID</option>
                <option value="client">Client</option>
                <option value="createdAt">Created At</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F9B71E] pointer-events-none"
              />
            </div>

            <button
              onClick={() =>
                setDirection((d) => (d === "asc" ? "desc" : "asc"))
              }
              className="ml-2 p-2 bg-[#2a2a2a] rounded-md border border-gray-700 text-gray-300"
              title="Toggle sort direction"
            >
              {direction === "asc" ? (
                <ChevronUp size={16} className="text-[#F9B71E]" />
              ) : (
                <ChevronDown size={16} className="text-[#F9B71E]" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 px-4 mb-4 text-sm font-bold text-neutral-500 uppercase tracking-wide">
          <div className="col-span-1">ID</div>
          <div className="col-span-5 px-4">Title</div>
          <div className="col-span-3">Client</div>
          <div className="col-span-3">Created At</div>
        </div>

        <div className="space-y-2">
          {sorted.map((p) => (
            <div
              key={p.projectID}
              role="button"
              tabIndex={0}
              onClick={() => openProject(p)}
              onKeyDown={(e) => e.key === "Enter" && openProject(p)}
              className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F] cursor-pointer hover:shadow-lg hover:bg-gray-800"
            >
              <div className="col-span-1 p-4 border-r border-[#ffffff49] bg-[#323232] text-neutral-300 font-medium whitespace-nowrap rounded-bl-lg rounded-tl-lg ">
                {p.projectID}
              </div>

              <div className="col-span-5 p-4 border-neutral-700/50 text-neutral-300">
                {p.title}
              </div>

              <div className="col-span-3 text-gray-300 text-sm">
                {p.clientName}
              </div>

              <div className="col-span-3 text-gray-300 text-[12px]">
                {fmt(p.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Project Modal */}
      <OverlayModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        title="Add Project"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-neutral-400">Title</label>
            <input
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Client</label>
            <input
              value={newProjectClient}
              onChange={(e) => setNewProjectClient(e.target.value)}
              className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Description</label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Game Title</label>
              <input
                value={newGameTitle}
                onChange={(e) => setNewGameTitle(e.target.value)}
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Game Genre</label>
              <input
                value={newGameGenre}
                onChange={(e) => setNewGameGenre(e.target.value)}
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">
                Platforms (comma separated)
              </label>
              <input
                value={newGamePlatforms}
                onChange={(e) => setNewGamePlatforms(e.target.value)}
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Game Version</label>
              <input
                value={newGameVersion}
                onChange={(e) => setNewGameVersion(e.target.value)}
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-400">Game Notes</label>
              <textarea
                value={newGameNotes}
                onChange={(e) => setNewGameNotes(e.target.value)}
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-neutral-400">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageFile}
                className="w-full mt-1 text-sm text-gray-300"
              />
              {newImage ? (
                <img
                  src={newImage}
                  alt="preview"
                  className="mt-2 w-full h-32 object-cover rounded-md border border-gray-700"
                />
              ) : (
                <div className="mt-2 w-full h-32 bg-gray-800 rounded-md flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddProject(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={createProject}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
            >
              Create Project
            </button>
          </div>
        </div>
      </OverlayModal>

      {/* Project Details Modal */}
      {selectedProject && editProject && (
        <OverlayModal
          isOpen={!!selectedProject}
          onClose={closeModal}
          title="Project Details"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {editProject.image ? (
                  <img
                    src={editProject.image}
                    alt={editProject.title}
                    className="w-full h-40 object-cover rounded-md border border-gray-700"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-800 rounded-md flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
                <div className="mt-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="edit-image-input"
                          className="inline-flex items-center px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] text-sm rounded cursor-pointer border border-gray-700 text-gray-300"
                        >
                          Change
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setEditProject((p) => ({ ...(p || {}), image: "" }))
                          }
                          className="px-3 py-2 bg-transparent border border-gray-700 text-sm rounded text-red-400 hover:bg-[#2a2a2a]"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        id="edit-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageFile}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 text-gray-300">
                <div className="mb-2">
                  <label className="text-xs text-neutral-400">Title</label>
                  <input
                    value={editProject.title || ""}
                    onChange={(e) =>
                      setEditProject((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                  />
                </div>

                <div className="text-sm text-neutral-400 mb-3">
                  <label className="text-xs text-neutral-400">Client</label>
                  <input
                    value={editProject.clientName || ""}
                    onChange={(e) =>
                      setEditProject((p) => ({
                        ...p,
                        clientName: e.target.value,
                      }))
                    }
                    className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-xs text-neutral-400">
                    Description
                  </label>
                  <textarea
                    value={editProject.description || ""}
                    onChange={(e) =>
                      setEditProject((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-neutral-400">Project ID</div>
                    <div className="font-semibold text-white">
                      {editProject.projectID}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Status</div>
                    <div className="font-semibold text-white">
                      {editProject.status}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Created</div>
                    <div className="font-semibold text-white">
                      {fmt(editProject.createdAt)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Criteria</div>
                    <div className="font-semibold text-white">
                      {(editProject.criteria || []).join(", ")}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Game Title</div>
                    <div>
                      <input
                        value={editProject.gameTitle || ""}
                        onChange={(e) =>
                          setEditProject((p) => ({
                            ...p,
                            gameTitle: e.target.value,
                          }))
                        }
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Game Genre</div>
                    <div>
                      <input
                        value={editProject.gameGenre || ""}
                        onChange={(e) =>
                          setEditProject((p) => ({
                            ...p,
                            gameGenre: e.target.value,
                          }))
                        }
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Platforms</div>
                    <div>
                      <input
                        value={(editProject.gamePlatforms || []).join(", ")}
                        onChange={(e) =>
                          setEditProject((p) => ({
                            ...p,
                            gamePlatforms: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Version</div>
                    <div>
                      <input
                        value={editProject.gameVersion || ""}
                        onChange={(e) =>
                          setEditProject((p) => ({
                            ...p,
                            gameVersion: e.target.value,
                          }))
                        }
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs text-neutral-400">Notes</div>
                    <div>
                      <textarea
                        value={editProject.gameNotes || ""}
                        onChange={(e) =>
                          setEditProject((p) => ({
                            ...p,
                            gameNotes: e.target.value,
                          }))
                        }
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Questionnaires</h4>
                {!selectedProject?.questionnaires ||
                selectedProject.questionnaires.length === 0 ? (
                  <button
                    onClick={openAddQuestionnaire}
                    className="bg-[#2a2a2a] px-3 py-1 rounded text-gray-300 text-sm"
                  >
                    Add Questionnaire
                  </button>
                ) : (
                  <button
                    onClick={openAddQuestionnaire}
                    className="bg-[#2a2a2a] px-3 py-1 rounded text-gray-300 text-sm"
                  >
                    Edit Questionnaire
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {(selectedProject.questionnaires || []).length === 0 && (
                  <div className="text-gray-400">No questionnaires yet.</div>
                )}
                {(selectedProject.questionnaires || []).map((q) => (
                  <div
                    key={q.questionnaireID}
                    className="p-3 bg-[#1b1b1b] rounded border border-[#ffffff22] text-gray-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-white">
                          {q.title}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {q.description}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400">
                        {fmt(q.createdAt)} •{" "}
                        {q.questions ? `${q.questions.length} questions` : "—"}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">
                      Reward: {q.pointsReward} pts • Responses:{" "}
                      {q.maxResponses ?? "—"} • Time limit:{" "}
                      {q.timeLimitSeconds ?? "—"}s
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add/Edit Questionnaire Modal (builder) */}
            {showAddQuestionnaire && (
              <OverlayModal
                isOpen={showAddQuestionnaire}
                onClose={() => {
                  setShowAddQuestionnaire(false);
                  resetQuestionnaireBuilder();
                }}
                title={
                  editingQuestionnaire
                    ? "Edit Questionnaire"
                    : "Add Questionnaire"
                }
              >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="text-xs text-neutral-400">Title</label>
                    <input
                      value={qTitle}
                      onChange={(e) => setQTitle(e.target.value)}
                      className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400">
                      Description
                    </label>
                    <textarea
                      value={qDesc}
                      onChange={(e) => setQDesc(e.target.value)}
                      className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400">
                        Points Reward
                      </label>
                      <input
                        type="number"
                        value={qPoints}
                        onChange={(e) => setQPoints(e.target.value)}
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">
                        Time Limit (s)
                      </label>
                      <input
                        type="number"
                        value={qTimeLimit}
                        onChange={(e) => setQTimeLimit(e.target.value)}
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">
                        Max Responses
                      </label>
                      <input
                        type="number"
                        value={qMaxResponses}
                        onChange={(e) => setQMaxResponses(e.target.value)}
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400">
                        Starts At
                      </label>
                      <input
                        type="datetime-local"
                        value={qStartsAt}
                        onChange={(e) => setQStartsAt(e.target.value)}
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">
                        Ends At
                      </label>
                      <input
                        type="datetime-local"
                        value={qEndsAt}
                        onChange={(e) => setQEndsAt(e.target.value)}
                        className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#ffffff10] p-5 bg-[#1b1b1b]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold">Questions</div>
                      <div>
                        <button
                          onClick={addQuestion}
                          className="bg-[#2a2a2a] px-3 py-1 rounded text-sm text-gray-300"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {qQuestions.map((qq, idx) => (
                        <div
                          key={qq.id}
                          className="p-3 border border-[#ffffff14] rounded"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-semibold text-white">
                              Question {idx + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeQuestion(qq.id)}
                                className="text-xs text-red-400 bg-[#2a2a2a] px-2 py-1 rounded"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="mb-2">
                            <input
                              placeholder="Question text"
                              value={qq.text}
                              onChange={(e) =>
                                updateQuestionField(
                                  qq.id,
                                  "text",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-2">
                            <select
                              value={qq.type}
                              onChange={(e) =>
                                updateQuestionField(
                                  qq.id,
                                  "type",
                                  e.target.value,
                                )
                              }
                              className="p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                            >
                              <option value="single">Single Choice</option>
                              <option value="multiple">Multiple Choice</option>
                              <option value="text">Text</option>
                            </select>
                            <input
                              type="number"
                              value={qq.points}
                              onChange={(e) =>
                                updateQuestionField(
                                  qq.id,
                                  "points",
                                  Number(e.target.value),
                                )
                              }
                              className="p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                              placeholder="Points"
                            />
                            <div />
                          </div>

                          {(qq.type === "single" || qq.type === "multiple") && (
                            <div>
                              <div className="text-xs text-neutral-400 mb-1">
                                Options
                              </div>
                              <div className="space-y-2">
                                {(qq.options || []).map((opt, i) => (
                                  <div key={i} className="flex gap-2">
                                    <input
                                      value={opt}
                                      onChange={(e) =>
                                        updateOption(qq.id, i, e.target.value)
                                      }
                                      className="flex-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                                    />
                                    <button
                                      onClick={() => removeOption(qq.id, i)}
                                      className="px-2 py-1 bg-[#2a2a2a] rounded text-sm text-red-400"
                                    >
                                      X
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(qq.id)}
                                  className="mt-2 px-3 py-1 bg-[#2a2a2a] rounded text-sm text-gray-300"
                                >
                                  Add Option
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setShowAddQuestionnaire(false);
                        resetQuestionnaireBuilder();
                      }}
                      className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        createOrUpdateQuestionnaire(editProject.projectID)
                      }
                      className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
                    >
                      Save Questionnaire
                    </button>
                  </div>
                </div>
              </OverlayModal>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={closeModal}
                className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
              >
                Close
              </button>
              <button
                onClick={saveProject}
                className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </OverlayModal>
      )}
    </div>
  );
}
