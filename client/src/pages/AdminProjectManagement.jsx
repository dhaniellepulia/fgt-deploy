import React, { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ImagePlus } from "lucide-react";
import TopBar from "../components/layouts/TopBar";
import OverlayModal from "../components/OverlayModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../auth/AuthContext";
import { request, authHeaders } from "../api/http";
import {
  fetchClientProjects,
  fetchClientProjectById,
  createClientProject,
  updateClientProject,
  deleteClientProject,
} from "../api/clientProjects";
import { uploadProjectImage } from "../api/clientProjects";
import {
  createQuestionnaire,
  updateQuestionnaire,
  addQuestion,
  addQuestionOption,
  fetchQuestionnaire,
} from "../api/questionnaires";
import QuestionnaireBuilder from "../components/QuestionnaireBuilder";

const fmt = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const mapQType = (t) => {
  if (typeof t === "number") return Number(t);
  switch ((t || "").toString().toLowerCase()) {
    case "single":
      return 3;
    case "multiple":
      return 4;
    case "text":
      return 1;
    default:
      return 1;
  }
};

export default function AdminProjectManagement() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [sortBy, setSortBy] = useState("projectID");
  const [direction, setDirection] = useState("asc");
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);

  useEffect(() => {
    // Keep local staged preview while image is pending save.
    if (pendingImageFile && imagePreview?.startsWith("blob:")) return;
    if (selectedProject?.projectImageUrl) {
      const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const url = String(selectedProject.projectImageUrl || "");
      setImagePreview(url.startsWith("/") ? `${base}${url}` : url);
    } else setImagePreview(null);
  }, [selectedProject, pendingImageFile, imagePreview]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newGameTitle, setNewGameTitle] = useState("");
  const [newGameGenre, setNewGameGenre] = useState("");
  const [newGamePlatforms, setNewGamePlatforms] = useState("");
  const [newGameVersion, setNewGameVersion] = useState("");
  const [newGameNotes, setNewGameNotes] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);

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
  const [builderInitialQuestionnaire, setBuilderInitialQuestionnaire] =
    useState(null);
  const [clients, setClients] = useState([]);
  const [newProjectClientId, setNewProjectClientId] = useState("");

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetchClientProjects(token);
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.projects)) list = res.projects;
        else if (Array.isArray(res?.items)) list = res.items;
        else if (Array.isArray(res?.data)) list = res.data;
        else list = [];
        if (mounted) setProjects(list);
      } catch (err) {
        console.error("Failed to load projects", err);
        const m = String(err?.message || "");
        if (m.includes("403") || /forbidden/i.test(m)) {
          alert("Permission denied: you do not have access to projects (403).");
        } else {
          alert("Failed to load projects. See console for details.");
        }
        if (mounted) setProjects([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        const res = await request("/admin/users?role=client", {
          headers: authHeaders(token),
        });
        const list = res?.items || res?.users || res || [];
        if (mounted) setClients(list);
      } catch (err) {
        console.warn("Failed to load clients", err);
        if (mounted) setClients([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const sorted = useMemo(() => {
    const arr = Array.isArray(projects) ? [...projects] : [];
    const cmp = (a, b) => {
      if (sortBy === "projectID")
        return Number(a.projectID) - Number(b.projectID);
      if (sortBy === "client")
        return (a.clientName || "").localeCompare(b.clientName || "");
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

  const openProject = async (p) => {
    setPendingImageFile(null);
    setSelectedProject(p);
    setEditProject({ ...p });

    if (token && p?.projectID) {
      try {
        const res = await fetchClientProjectById(p.projectID, token);
        const project = res?.item || res?.project || res || p;
        if (Array.isArray(project.gamePlatforms)) {
          project.gamePlatforms = project.gamePlatforms.join(", ");
        } else if (
          project.gamePlatforms === null ||
          project.gamePlatforms === undefined
        ) {
          project.gamePlatforms = "";
        } else {
          project.gamePlatforms = String(project.gamePlatforms);
        }
        setSelectedProject(project);
        setEditProject({ ...project });
        const existing = project.questionnaires?.[0] ?? null;
        if (existing) {
          setEditingQuestionnaire(false);
          setEditingQuestionnaireId(existing.questionnaireID);
        } else {
          setEditingQuestionnaireId(null);
        }
      } catch (err) {
        console.error("Failed to load project", err);
        alert("Failed to load project details.");
      }
    } else {
      const existing = p.questionnaires?.[0] ?? null;
      if (existing) {
        setEditingQuestionnaire(false);
        setEditingQuestionnaireId(existing.questionnaireID);
      } else {
        setEditingQuestionnaireId(null);
      }
    }
  };

  const onImageSelected = (e) => {
    const f = e?.target?.files?.[0];
    if (!f || !editProject) return;
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setPendingImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const updateQuestionnaireStatus = async (q, newStatusID) => {
    if (!token) return;
    try {
      const payload = { ...q, statusID: Number(newStatusID) };
      if (Number(newStatusID) === 2 && !payload.publishedAt)
        payload.publishedAt = new Date().toISOString();
      if (Number(newStatusID) !== 2) payload.publishedAt = null;
      await updateQuestionnaire(q.questionnaireID ?? q.id, token, payload);
      if (editProject?.projectID) {
        const pr = await fetchClientProjectById(editProject.projectID, token);
        const refreshed = pr?.item || pr?.project || pr || null;
        if (refreshed) {
          setSelectedProject(refreshed);
          setEditProject(refreshed);
          setProjects((prev) =>
            Array.isArray(prev)
              ? prev.map((p) =>
                  p.projectID === refreshed.projectID ? refreshed : p,
                )
              : prev,
          );
        }
      }
    } catch (err) {
      console.error("Failed to update questionnaire status", err);
      alert("Failed to update status");
    }
  };

  const closeModal = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedProject(null);
    setEditProject(null);
    setPendingImageFile(null);
    setImagePreview(null);
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
    setShowAddProject(true);
  };

  const createProject = async () => {
    const platformsString = newGamePlatforms
      ? newGamePlatforms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(", ")
      : "";

    const payload = {
      title: newProjectTitle || `Untitled`,
      description: newProjectDescription || "",
      gameTitle: newGameTitle || "",
      gameGenre: newGameGenre || "",
      gamePlatforms: platformsString || null,
      gameVersion: newGameVersion || "",
      gameNotes: newGameNotes || "",
      clientUserID: newProjectClientId || undefined,
    };

    try {
      if (!token) throw new Error("Not authenticated");
      const res = await createClientProject(token, payload);
      const created = res?.item || res || null;
      if (created) {
        const clientId = created.clientUserID
          ? String(created.clientUserID)
          : newProjectClientId || "";
        const clientObj = clients.find(
          (c) => String(c.userID) === String(clientId),
        );
        created.clientName =
          clientObj?.clientName ||
          (clientObj
            ? `${clientObj.firstName || ""} ${clientObj.lastName || ""}`.trim()
            : created.clientName) ||
          clientObj?.email ||
          created.clientName ||
          null;

        setProjects((prev) =>
          Array.isArray(prev) ? [created, ...prev] : [created],
        );
      }
      setShowAddProject(false);
    } catch (err) {
      console.error("Create project failed", err);
      alert(err.message || "Create project failed");
    }
  };

  const saveProject = async () => {
    if (!editProject) return;
    try {
      if (!token) throw new Error("Not authenticated");
      setUploadingImage(true);
      const { projectID, ...body } = editProject;
      const gp = Array.isArray(body.gamePlatforms)
        ? body.gamePlatforms
            .map((s) => String(s).trim())
            .filter(Boolean)
            .join(", ")
        : (body.gamePlatforms ?? "");
      const normalized = {
        ...body,
        gamePlatforms: gp === "" ? null : gp,
        clientUserID:
          body.clientUserID === undefined ? undefined : body.clientUserID,
      };
      const res = await updateClientProject(projectID, token, normalized);
      let updated = res?.item || res || { projectID, ...normalized };

      if (pendingImageFile) {
        const imgRes = await uploadProjectImage(
          projectID,
          token,
          pendingImageFile,
        );
        const imageUpdated = imgRes?.item || imgRes || null;
        if (imageUpdated?.projectImageUrl) {
          updated = {
            ...updated,
            ...imageUpdated,
            questionnaires:
              imageUpdated.questionnaires ??
              updated.questionnaires ??
              selectedProject?.questionnaires ??
              [],
          };
        }
      }

      const clientId = updated.clientUserID ?? editProject.clientUserID ?? "";
      const clientObj = clients.find(
        (c) => String(c.userID) === String(clientId),
      );
      updated.clientName =
        updated.clientName ||
        clientObj?.clientName ||
        (clientObj
          ? `${clientObj.firstName || ""} ${clientObj.lastName || ""}`.trim()
          : null) ||
        clientObj?.email ||
        updated.clientName;
      setProjects((prev) =>
        Array.isArray(prev)
          ? prev.map((p) => (p.projectID === projectID ? updated : p))
          : [updated],
      );
      setSelectedProject(updated);
      setEditProject({ ...updated });
      setPendingImageFile(null);
      closeModal();
    } catch (err) {
      console.error("Save project failed", err);
      alert(err.message || "Save project failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteProject = async (projectID) => {
    try {
      if (!token) throw new Error("Not authenticated");
      await deleteClientProject(projectID, token);
      setProjects((prev) =>
        Array.isArray(prev)
          ? prev.filter((p) => p.projectID !== projectID)
          : [],
      );
      closeModal();
    } catch (err) {
      console.error("Delete project failed", err);
      alert(err.message || "Delete project failed");
    }
  };

  const requestConfirm = (payload) => {
    setConfirmPayload(payload);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmPayload) return;
    const { type, projectID } = confirmPayload;

    if (type === "deleteProject") {
      deleteProject(projectID);
    } else if (type === "saveProject") {
      saveProject();
    } else if (type === "saveQuestionnaire") {
      createOrUpdateQuestionnaire(projectID);
    } else if (type === "createProject") {
      createProject();
    }

    setConfirmOpen(false);
    setConfirmPayload(null);
  };

  const openAddQuestionnaire = async () => {
    const existing = selectedProject?.questionnaires?.[0] ?? null;
    if (existing) {
      setEditingQuestionnaire(true);
      setEditingQuestionnaireId(existing.questionnaireID);
      if (token) {
        try {
          const res = await fetchQuestionnaire(existing.questionnaireID, token);
          const full = res?.item || res || existing;
          setBuilderInitialQuestionnaire(full);
        } catch (err) {
          console.warn("Failed to load full questionnaire, falling back:", err);
          setBuilderInitialQuestionnaire(existing);
        }
      } else {
        setBuilderInitialQuestionnaire(existing);
      }
    } else {
      setBuilderInitialQuestionnaire(null);
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

  const addQuestion = () => {
    const q = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: "",
      type: "single",
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

  const createOrUpdateQuestionnaire = async (projectID) => {
    const qNextID =
      Math.max(
        0,
        ...(Array.isArray(projects)
          ? projects.flatMap(
              (p) =>
                p.questionnaires?.map((q) => Number(q.questionnaireID)) || [],
            )
          : []),
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
      startsAt: qStartsAt ? new Date(qStartsAt).toISOString() : null,
      endsAt: qEndsAt ? new Date(qEndsAt).toISOString() : null,
      timeLimitSeconds: qTimeLimit ? Number(qTimeLimit) : null,
      maxResponses: qMaxResponses ? Number(qMaxResponses) : null,
      pointsReward: Number(qPoints) || 0,
      createdAt: new Date().toISOString(),
      questions: preparedQuestions,
      projectID,
    };

    try {
      if (!token) throw new Error("Not authenticated");

      let res;
      if (editingQuestionnaireId) {
        res = await updateQuestionnaire(editingQuestionnaireId, token, payload);
      } else {
        res = await createQuestionnaire(token, payload);
      }

      const qResRaw = res?.item || res?.questionnaire || res || payload;
      console.log("questionnaire response:", qResRaw);

      const normalizedQRes = {
        ...qResRaw,
        questionnaireID:
          qResRaw.questionnaireID ?? qResRaw.id ?? payload.questionnaireID,
        title: qResRaw.title ?? payload.title,
        description: qResRaw.description ?? payload.description,
        pointsReward:
          qResRaw.pointsReward ?? qResRaw.points ?? payload.pointsReward,
        timeLimitSeconds:
          qResRaw.timeLimitSeconds ??
          qResRaw.timeLimit ??
          payload.timeLimitSeconds,
        maxResponses: qResRaw.maxResponses ?? payload.maxResponses,
        startsAt: qResRaw.startsAt ?? payload.startsAt,
        endsAt: qResRaw.endsAt ?? payload.endsAt,
        createdAt: qResRaw.createdAt ?? payload.createdAt,
        questions: (Array.isArray(qResRaw.questions)
          ? qResRaw.questions
          : Array.isArray(qResRaw.items)
            ? qResRaw.items
            : payload.questions || []
        ).map((qq, idx) => ({
          id: qq.id ?? qq.questionID ?? `q_${Date.now()}_${idx}`,
          text: qq.text ?? qq.questionText ?? qq.question ?? "",
          type: qq.type ?? qq.questionType ?? "single",
          points: Number(qq.points ?? qq.pointsReward ?? 0),
          options: Array.isArray(qq.options)
            ? qq.options
            : Array.isArray(qq.choices)
              ? qq.choices.map((c) =>
                  typeof c === "string" ? c : c.text || "",
                )
              : [],
        })),
      };

      if (
        Array.isArray(preparedQuestions) &&
        preparedQuestions.length > 0 &&
        (!Array.isArray(qResRaw.questions) || qResRaw.questions.length === 0)
      ) {
        try {
          const questionnaireId = normalizedQRes.questionnaireID;
          let displayOrder = 1;
          for (const pq of preparedQuestions) {
            const qPayload = {
              questionTypeID: mapQType(pq.type),
              questionText: pq.text || "Untitled question",
              helpText: null,
              isRequired: false,
              displayOrder,
            };
            displayOrder += 1;

            const qCreateRes = await addQuestion(
              questionnaireId,
              token,
              qPayload,
            );
            const createdQuestionId =
              qCreateRes?.item?.questionID ||
              qCreateRes?.questionID ||
              qCreateRes?.id;
            if (
              createdQuestionId &&
              Array.isArray(pq.options) &&
              pq.options.length
            ) {
              let optionOrder = 1;
              for (const optText of pq.options) {
                await addQuestionOption(createdQuestionId, token, {
                  optionText: String(optText || ""),
                  displayOrder: optionOrder,
                });
                optionOrder += 1;
              }
            }
          }
        } catch (err) {
          console.warn(
            "Admin: failed to persist nested questions/options",
            err,
          );
        }
      }

      try {
        if (token) {
          const prRes = await fetchClientProjectById(projectID, token);
          const refreshedProject =
            prRes?.item || prRes?.project || prRes || null;

          if (refreshedProject) {
            const normalizedProject = { ...refreshedProject };
            if (Array.isArray(normalizedProject.gamePlatforms)) {
              normalizedProject.gamePlatforms =
                normalizedProject.gamePlatforms.join(", ");
            } else {
              normalizedProject.gamePlatforms = String(
                normalizedProject.gamePlatforms ?? "",
              );
            }

            setProjects((prev) =>
              Array.isArray(prev)
                ? prev.map((p) =>
                    p.projectID === projectID ? normalizedProject : p,
                  )
                : [normalizedProject],
            );
            setEditProject(normalizedProject);
            setSelectedProject(normalizedProject);
            setShowAddQuestionnaire(false);
            resetQuestionnaireBuilder();
            return;
          }
        }
      } catch (refreshErr) {
        console.warn(
          "Project refresh failed, falling back to local update",
          refreshErr,
        );
      }

      setProjects((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              p.projectID === projectID
                ? { ...p, questionnaires: [normalizedQRes] }
                : p,
            )
          : [],
      );

      if (editProject && editProject.projectID === projectID) {
        setEditProject((ep) => ({
          ...(ep || {}),
          questionnaires: [normalizedQRes],
        }));
        setSelectedProject((sp) => ({
          ...(sp || {}),
          questionnaires: [normalizedQRes],
        }));
      }

      setShowAddQuestionnaire(false);
      resetQuestionnaireBuilder();
    } catch (err) {
      console.error("Save questionnaire failed", err);
      alert(err.message || "Save questionnaire failed");
    }
  };

  const platformsDisplay = (gp) => {
    if (!gp) return "";
    if (Array.isArray(gp)) return gp.join(", ");
    return String(gp);
  };

  return (
    <div className="min-h-screen">
      <header className="flex w-full item-start justify-start lg:items-center lg:justify-between flex-col-reverse lg:flex-row py-5 lg:py-15 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[#F9B71E] font-bold text-2xl">
            Project Management
          </h2>
        </div>
        <TopBar />
      </header>

      <div className="rounded-xl bg-[#252525] p-8">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-white text-xl font-bold">Projects</h4>
        </div>

        <div className="flex flex-col-reverse lg:flex-row item-start justify-start lg:items-center lg:justify-between gap-3 mb-10">
          <div>
            <button
              onClick={openAddProject}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded text-sm"
            >
              + Add Project
            </button>
          </div>
          <div className="flex items-center">
            <label className="text-sm text-gray-300 mr-2">Sort by</label>
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

        <div className="space-y-2 overflow-x-scroll lg:overflow-hidden">
          <div className="space-y-2 w-max lg:w-full">
            {sorted.map((p) => (
              <div
                key={String(p.projectID)}
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
      </div>

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
            <select
              value={newProjectClientId}
              onChange={(e) => setNewProjectClientId(e.target.value)}
              className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={String(c.userID)} value={String(c.userID)}>
                  {c.clientName ||
                    `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
                    c.email}
                </option>
              ))}
            </select>
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
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddProject(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => requestConfirm({ type: "createProject" })}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
            >
              Create Project
            </button>
          </div>
        </div>
      </OverlayModal>

      {selectedProject && editProject && (
        <OverlayModal
          isOpen={!!selectedProject}
          onClose={closeModal}
          title="Project Details"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 text-gray-300">
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
                  <select
                    value={String(editProject.clientUserID ?? "")}
                    onChange={(e) => {
                      const id = e.target.value || null;
                      const clientObj = clients.find(
                        (c) => String(c.userID) === id,
                      );
                      setEditProject((p) => ({
                        ...(p || {}),
                        clientUserID: id ? id : p.clientUserID,
                        clientName: clientObj
                          ? clientObj.clientName ||
                            `${clientObj.firstName || ""} ${clientObj.lastName || ""}`.trim()
                          : p.clientName,
                      }));
                    }}
                    className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                  >
                    <option value="">(Unassigned / Select client)</option>
                    {clients.map((c) => (
                      <option key={String(c.userID)} value={String(c.userID)}>
                        {c.clientName ||
                          `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
                          c.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-neutral-400">
                    Project Image
                  </label>
                  <div className="mt-2 rounded-xl border border-gray-700 bg-[#171717] p-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                      <div className="w-full lg:w-64 aspect-video bg-[#101010] border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="project"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <ImagePlus size={20} />
                            <span className="text-xs">No image selected</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-3 py-2 rounded-md text-sm font-medium hover:opacity-90">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={onImageSelected}
                              className="hidden"
                            />
                            {uploadingImage ? "Uploading..." : "Choose Image"}
                          </label>
                          {uploadingImage ? (
                            <span className="text-xs text-blue-300">
                              Upload in progress...
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-neutral-400 mt-3">
                          Recommended: 1280x720 (16:9), PNG or JPG.
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          This image is shown in project listings and details.
                        </div>
                      </div>
                    </div>
                  </div>
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
                    <div className="text-xs text-neutral-400">Created</div>
                    <div className="font-semibold text-white">
                      {fmt(editProject.createdAt)}
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
                        value={platformsDisplay(editProject.gamePlatforms)}
                        onChange={(e) =>
                          setEditProject((p) => ({
                            ...(p || {}),
                            gamePlatforms: e.target.value,
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
                    key={String(q.questionnaireID)}
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
                        {fmt(q.createdAt)}{" "}
                        {q.questions ? `${q.questions.length} questions` : ""}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">
                      Reward: {q.pointsReward} pts Responses:{" "}
                      {q.maxResponses ?? ""} Time limit:{" "}
                      {q.timeLimitSeconds ?? ""}s
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={String(q.statusID ?? "")}
                        onChange={(e) =>
                          updateQuestionnaireStatus(q, e.target.value)
                        }
                        className="bg-[#2a2a2a] border border-gray-700 rounded p-2 text-sm text-gray-300"
                      >
                        <option value="1">Upcoming</option>
                        <option value="2">Active</option>
                        <option value="3">Past</option>
                      </select>
                      <div className="text-xs text-neutral-400">
                        Change questionnaire status
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                <div className="p-4">
                  <QuestionnaireBuilder
                    token={token}
                    projectID={editProject?.projectID}
                    initialQuestionnaire={
                      editingQuestionnaire
                        ? builderInitialQuestionnaire ||
                          selectedProject?.questionnaires?.[0] ||
                          null
                        : null
                    }
                    onSaved={async (fullQuestionnaire) => {
                      try {
                        if (token && editProject?.projectID) {
                          const prRes = await fetchClientProjectById(
                            editProject.projectID,
                            token,
                          );
                          const refreshedProject =
                            prRes?.item || prRes?.project || prRes || null;
                          if (refreshedProject) {
                            if (Array.isArray(refreshedProject.gamePlatforms)) {
                              refreshedProject.gamePlatforms =
                                refreshedProject.gamePlatforms.join(", ");
                            } else {
                              refreshedProject.gamePlatforms = String(
                                refreshedProject.gamePlatforms ?? "",
                              );
                            }

                            if (fullQuestionnaire) {
                              const qid =
                                fullQuestionnaire.questionnaireID ??
                                fullQuestionnaire.id;
                              if (
                                Array.isArray(refreshedProject.questionnaires)
                              ) {
                                const idx =
                                  refreshedProject.questionnaires.findIndex(
                                    (q) =>
                                      String(q.questionnaireID ?? q.id) ===
                                      String(qid),
                                  );
                                if (idx !== -1) {
                                  refreshedProject.questionnaires[idx] =
                                    fullQuestionnaire;
                                } else {
                                  refreshedProject.questionnaires = [
                                    fullQuestionnaire,
                                    ...refreshedProject.questionnaires,
                                  ];
                                }
                              } else {
                                refreshedProject.questionnaires = [
                                  fullQuestionnaire,
                                ];
                              }
                            }

                            setProjects((prev) =>
                              Array.isArray(prev)
                                ? prev.map((p) =>
                                    p.projectID === refreshedProject.projectID
                                      ? refreshedProject
                                      : p,
                                  )
                                : [refreshedProject],
                            );
                            setEditProject(refreshedProject);
                            setSelectedProject(refreshedProject);
                          } else {
                            setProjects((prev) =>
                              Array.isArray(prev)
                                ? prev.map((p) =>
                                    p.projectID === editProject.projectID
                                      ? {
                                          ...p,
                                          questionnaires: [fullQuestionnaire],
                                        }
                                      : p,
                                  )
                                : [],
                            );
                            setEditProject((ep) => ({
                              ...(ep || {}),
                              questionnaires: [fullQuestionnaire],
                            }));
                            setSelectedProject((sp) => ({
                              ...(sp || {}),
                              questionnaires: [fullQuestionnaire],
                            }));
                          }
                        } else {
                          setProjects((prev) =>
                            Array.isArray(prev)
                              ? prev.map((p) =>
                                  p.projectID === editProject.projectID
                                    ? {
                                        ...p,
                                        questionnaires: [fullQuestionnaire],
                                      }
                                    : p,
                                )
                              : [],
                          );
                          setEditProject((ep) => ({
                            ...(ep || {}),
                            questionnaires: [fullQuestionnaire],
                          }));
                          setSelectedProject((sp) => ({
                            ...(sp || {}),
                            questionnaires: [fullQuestionnaire],
                          }));
                        }
                      } catch (err) {
                        console.warn(
                          "Failed to refresh project after questionnaire save",
                          err,
                        );
                      } finally {
                        setShowAddQuestionnaire(false);
                        resetQuestionnaireBuilder();
                        setBuilderInitialQuestionnaire(null);
                      }
                    }}
                    onCancel={() => {
                      setShowAddQuestionnaire(false);
                      resetQuestionnaireBuilder();
                      setBuilderInitialQuestionnaire(null);
                    }}
                  />
                </div>
              </OverlayModal>
            )}

            <div className="flex justify-between items-center gap-3 mt-2">
              <div>
                <button
                  onClick={() =>
                    requestConfirm({
                      type: "deleteProject",
                      projectID: editProject.projectID,
                      title: editProject.title,
                    })
                  }
                  className="px-4 py-2 bg-transparent border border-gray-700 text-red-400 rounded text-sm hover:bg-[#2a2a2a]"
                >
                  Delete Project
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => requestConfirm({ type: "saveProject" })}
                  className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </OverlayModal>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title={
          confirmPayload?.title
            ? `Confirm: ${confirmPayload.title}`
            : "Confirm action"
        }
        message={
          confirmPayload?.type === "deleteProject"
            ? "Delete this project? This cannot be undone."
            : confirmPayload?.type === "saveProject"
              ? "Save changes to this project?"
              : confirmPayload?.type === "saveQuestionnaire"
                ? "Save questionnaire for this project?"
                : confirmPayload?.type === "createProject"
                  ? "Create project with the entered details?"
                  : "Are you sure?"
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        danger={confirmPayload?.type === "deleteProject"}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmPayload(null);
        }}
      />
    </div>
  );
}
