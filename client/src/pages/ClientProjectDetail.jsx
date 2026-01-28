import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";
import { useAuth } from "../auth/AuthContext";
import {
  createQuestionnaire,
  deleteQuestionnaire,
  updateQuestionnaire,
} from "../api/questionnaires";
import {
  fetchClientProjectById,
  updateClientProject,
} from "../api/clientProjects";

function ClientProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [questionnaireForm, setQuestionnaireForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    timeLimitSeconds: "",
    maxResponses: "",
    statusID: 1,
  });
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

    async function load() {
      try {
        setLoading(true);
        const res = await fetchClientProjectById(id, token);
        if (mounted) {
          setProject(res.item);
          setProjectForm({
            title: res.item.title || "",
            description: res.item.description || "",
            gameTitle: res.item.gameTitle || "",
            gameGenre: res.item.gameGenre || "",
            gamePlatforms: res.item.gamePlatforms || "",
            gameVersion: res.item.gameVersion || "",
            gameNotes: res.item.gameNotes || "",
          });
          setError("");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load project");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (token) load();

    return () => {
      mounted = false;
    };
  }, [id, token]);

  const handleProjectInput = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionnaireInput = (e) => {
    const { name, value } = e.target;
    setQuestionnaireForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectSave = async () => {
    try {
      setSaving(true);
      const res = await updateClientProject(id, token, projectForm);
      setProject(res.item);
    } catch (err) {
      alert(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuestionnaire = async () => {
    if (!questionnaireForm.title) return;
    try {
      setSaving(true);
      const payload = {
        ...questionnaireForm,
        projectID: id,
        startsAt: questionnaireForm.startsAt || null,
        endsAt: questionnaireForm.endsAt || null,
        timeLimitSeconds: questionnaireForm.timeLimitSeconds || null,
        maxResponses: questionnaireForm.maxResponses || null,
      };
      await createQuestionnaire(token, payload);
      const refreshed = await fetchClientProjectById(id, token);
      setProject(refreshed.item);
      setQuestionnaireForm({
        title: "",
        description: "",
        startsAt: "",
        endsAt: "",
        timeLimitSeconds: "",
        maxResponses: "",
        statusID: 1,
      });
    } catch (err) {
      alert(err.message || "Failed to create questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestionnaire = async (qid) => {
    if (!window.confirm("Delete this questionnaire?")) return;
    try {
      await deleteQuestionnaire(qid, token);
      const refreshed = await fetchClientProjectById(id, token);
      setProject(refreshed.item);
    } catch (err) {
      alert(err.message || "Failed to delete questionnaire");
    }
  };

  if (loading) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!project) {
    return <p className="text-neutral-400">Project not found.</p>;
  }

  return (
    <div className="min-h-screen text-white">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] text-2xl font-bold">
            {project.title}
          </h3>
        </div>
        <TopBar />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#252525] rounded-xl p-6">
          <h4 className="font-semibold mb-4">Project Details</h4>
          <div className="grid grid-cols-1 gap-3">
            <input
              name="title"
              value={projectForm.title}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Project title"
            />
            <input
              name="gameTitle"
              value={projectForm.gameTitle}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Game title"
            />
            <input
              name="gameGenre"
              value={projectForm.gameGenre}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Game genre"
            />
            <input
              name="gamePlatforms"
              value={projectForm.gamePlatforms}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Platforms"
            />
            <input
              name="gameVersion"
              value={projectForm.gameVersion}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Game version"
            />
            <textarea
              name="description"
              value={projectForm.description}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Project description"
            />
            <textarea
              name="gameNotes"
              value={projectForm.gameNotes}
              onChange={handleProjectInput}
              className="bg-white text-black rounded p-2"
              placeholder="Game notes"
            />
          </div>
          <button
            onClick={handleProjectSave}
            disabled={saving}
            className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Project"}
          </button>
        </section>

        <section className="bg-[#252525] rounded-xl p-6">
          <h4 className="font-semibold mb-4">Create Questionnaire</h4>
          <div className="grid grid-cols-1 gap-3">
            <input
              name="title"
              value={questionnaireForm.title}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
              placeholder="Questionnaire title"
            />
            <textarea
              name="description"
              value={questionnaireForm.description}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
              placeholder="Description"
            />
            <input
              type="datetime-local"
              name="startsAt"
              value={questionnaireForm.startsAt}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
            />
            <input
              type="datetime-local"
              name="endsAt"
              value={questionnaireForm.endsAt}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
            />
            <input
              name="timeLimitSeconds"
              value={questionnaireForm.timeLimitSeconds}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
              placeholder="Time limit (seconds)"
            />
            <input
              name="maxResponses"
              value={questionnaireForm.maxResponses}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
              placeholder="Max responses"
            />
            <select
              name="statusID"
              value={questionnaireForm.statusID}
              onChange={handleQuestionnaireInput}
              className="bg-white text-black rounded p-2"
            >
              <option value={1}>Draft</option>
              <option value={2}>Published</option>
              <option value={3}>Archived</option>
            </select>
          </div>
          <button
            onClick={handleCreateQuestionnaire}
            disabled={saving}
            className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Questionnaire"}
          </button>
        </section>
      </div>

      <section className="mt-8 bg-[#252525] rounded-xl p-6">
        <h4 className="font-semibold mb-4">Questionnaires</h4>
        {project.questionnaires?.length ? (
          <div className="space-y-3">
            {project.questionnaires.map((q) => (
              <div
                key={q.questionnaireID}
                className="flex items-center justify-between border border-neutral-800 rounded-lg p-4"
              >
                <div>
                  <h5 className="font-semibold">{q.title}</h5>
                  <p className="text-xs text-neutral-400">
                    Status {q.statusID}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      navigate(
                        `/client/projects/${project.projectID}/questionnaires/${q.questionnaireID}`
                      )
                    }
                    className="text-sm text-yellow-400"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleDeleteQuestionnaire(q.questionnaireID)}
                    className="text-sm text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">No questionnaires yet.</p>
        )}
      </section>
    </div>
  );
}

export default ClientProjectDetail;

