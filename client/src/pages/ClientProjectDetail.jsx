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
import { Trash2, Edit, Settings } from "lucide-react";
import Select from "../components/Select.jsx";
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
    <div className="min-h-screen text-white bg-[#1F1F1F]">
      <header className="flex items-center justify-end py-5 px-5 lg:px-10 gap-4">
        <TopBar />
      </header>

      <div>
        <main className="w-full lg:max-w-[1440px] mx-auto p-5 mt-5 lg:mt-20">
          <div className="mb-10">
            <h3 className="text-[#F9B71E] text-2xl font-bold">
              {project.title}
            </h3>
          </div>

          <div className="flex flex-col gap-5 lg:gap-15">
            <section className="bg-[#252525] rounded-xl p-5 lg:p-15 shadow-md ">
              <h4 className="font-semibold mb-3 text-2xl text-gray-200">
                Project Details
              </h4>
              <hr className="border-gray-500 mb-10" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Project Title
                  </label>
                  <input
                    name="title"
                    value={projectForm.title}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Project title"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1  font-semibold">
                    Game Title
                  </label>
                  <input
                    name="gameTitle"
                    value={projectForm.gameTitle}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Game title"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1">Game Genre</label>
                  <input
                    name="gameGenre"
                    value={projectForm.gameGenre}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Game genre"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1  font-semibold">
                    Platforms
                  </label>
                  <input
                    name="gamePlatforms"
                    value={projectForm.gamePlatforms}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Platforms"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Game Version
                  </label>
                  <input
                    name="gameVersion"
                    value={projectForm.gameVersion}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Game version"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Project description"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Game Notes
                  </label>
                  <textarea
                    name="gameNotes"
                    value={projectForm.gameNotes}
                    onChange={handleProjectInput}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                    placeholder="Game notes"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-10">
                {" "}
                <button
                  onClick={handleProjectSave}
                  disabled={saving}
                  className="bg-linear-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-3 rounded font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update Project"}
                </button>
              </div>
            </section>

            <section className="bg-[#252525] rounded-xl p-5 lg:p-15 shadow-md">
              <h4 className="font-semibold mb-3 text-2xl text-gray-200">
                Create Questionnaire
              </h4>
              <hr className="border-gray-500 mb-10" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Title
                  </label>
                  <div className="md:col-span-2 space-y-2">
                    <input
                      name="title"
                      value={questionnaireForm.title}
                      onChange={handleQuestionnaireInput}
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg w-full"
                      placeholder="e.g., Alpha Build Feedback"
                    />
                    <p className="text-xs text-neutral-400">
                      Short internal name to identify this questionnaire.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Description
                  </label>
                  <div className="md:col-span-2 space-y-1">
                    <textarea
                      name="description"
                      value={questionnaireForm.description}
                      onChange={handleQuestionnaireInput}
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg  w-full"
                      placeholder="Explain what you want testers to focus on."
                    />
                    <p className="text-xs text-neutral-400">
                      Shown to testers at the top of the questionnaire.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Starts At
                  </label>
                  <div className="md:col-span-2 space-y-2">
                    <input
                      type="datetime-local"
                      name="startsAt"
                      value={questionnaireForm.startsAt}
                      onChange={handleQuestionnaireInput}
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg  w-full"
                    />
                    <p className="text-xs text-neutral-400">
                      Optional. When the questionnaire becomes available.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Ends At
                  </label>
                  <div className="md:col-span-2 space-y-2">
                    <input
                      type="datetime-local"
                      name="endsAt"
                      value={questionnaireForm.endsAt}
                      onChange={handleQuestionnaireInput}
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg w-full"
                    />
                    <p className="text-xs text-neutral-400">
                      Optional. When the questionnaire closes to new responses.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Time Limit
                  </label>
                  <div className="md:col-span-2 space-y-2">
                    <input
                      name="timeLimitSeconds"
                      value={questionnaireForm.timeLimitSeconds}
                      onChange={handleQuestionnaireInput}
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg  w-full"
                      placeholder="Seconds per response (leave blank for no limit)"
                    />
                    <p className="text-xs text-neutral-400">
                      Sets how long testers have to complete the questionnaire.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Max Responses
                  </label>
                  <div className="md:col-span-2 space-y-2">
                    <input
                      name="maxResponses"
                      value={questionnaireForm.maxResponses}
                      onChange={handleQuestionnaireInput}
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg w-full"
                      placeholder="Maximum submissions (leave blank for unlimited)"
                    />
                    <p className="text-xs text-neutral-400">
                      Caps how many responses you want to collect.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-300 mb-1 font-semibold">
                    Status
                  </label>
                  <div className="md:col-span-2 space-y-2">
                    <Select
                      name="statusID"
                      value={questionnaireForm.statusID}
                      onChange={handleQuestionnaireInput}
                      className="w-full"
                      options={[
                        { value: 1, label: "Draft" },
                        { value: 2, label: "Published" },
                        { value: 3, label: "Archived" },
                      ]}
                    />
                    <p className="text-xs text-neutral-400">
                      Draft is private, Published is visible, Archived is
                      read-only.
                    </p>
                  </div>
                </div>
              </div>
              <div></div>
              <div className="flex justify-end mt-10">
                <button
                  onClick={handleCreateQuestionnaire}
                  disabled={saving}
                  className="bg-linear-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-3 rounded font-semibolddisabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create Questionnaire"}
                </button>
              </div>
            </section>
            <section className="bg-[#252525] rounded-xl p-5 lg:p-15 shadow-md ">
              <h4 className="font-semibold mb-3 text-2xl text-gray-200">
                Questionnaires
              </h4>
              <hr className="border-gray-500 mb-10" />
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
                              `/client/projects/${project.projectID}/questionnaires/${q.questionnaireID}`,
                            )
                          }
                          className="text-sm text-yellow-400"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteQuestionnaire(q.questionnaireID)
                          }
                          className="text-sm text-red-400"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">
                  No questionnaires yet.
                </p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientProjectDetail;
