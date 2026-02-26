//Dashboard > Project > Project Details
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";
import { fetchProjectById, joinProject } from "../api/projects";
import { useAuth } from "../auth/AuthContext";
import OverlayModal from "../components/OverlayModal.jsx";
import { startQuestionnaireResponse } from "../api/questionnaires.js";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [showQuestionnairesModal, setShowQuestionnairesModal] = useState(false);
  const [responsesMap, setResponsesMap] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const imageSrc = useMemo(() => {
    if (!project) return null;
    const url = project.projectImageUrl || project.imageUrl || "";
    return url ? (url.startsWith("/") ? `${API_BASE}${url}` : url) : null;
  }, [project]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchProjectById(id, token);
        if (mounted) {
          setProject(res.item);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load project");
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
  }, [id, token]);

  useEffect(() => {
    let mounted = true;
    async function loadResponses() {
      if (!token) return;
      try {
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/questionnaire-responses/me`, {
          headers,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!mounted) return;
        const items = Array.isArray(data.items)
          ? data.items
          : data.items
            ? [data.items]
            : [];
        const map = {};
        items.forEach((r) => {
          const qid =
            r?.questionnaire?.id ?? r?.questionnaire?.questionnaireID ?? null;
          if (qid != null) map[String(qid)] = r;
        });
        setResponsesMap(map);
      } catch (err) {
        // ignore; durations will fallback to project.questionnaires values
        console.debug("failed to load questionnaire responses", err);
      }
    }
    loadResponses();
    return () => {
      mounted = false;
    };
  }, [token]);

  const details = useMemo(() => {
    if (!project) return [];
    return [
      {
        label: "GAME",
        value: project.gameTitle || "N/A",
      },
      {
        label: "GENRE",
        value: project.gameGenre || "N/A",
      },
      {
        label: "PLATFORMS",
        value: project.gamePlatforms || "N/A",
      },
      {
        label: "STATUS",
        value: project.status || "N/A",
      },
    ];
  }, [project]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      await joinProject(id, token);
      const refreshed = await fetchProjectById(id, token);
      setProject(refreshed.item);
    } catch (err) {
      alert(err.message || "Failed to join project");
    } finally {
      setJoining(false);
    }
  };

  function fmtDurationWithSeconds(start, end) {
    if (!start) return null;
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    if (isNaN(s) || isNaN(e)) return null;
    const diffSec = Math.max(0, Math.floor((e - s) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins}m ${secs}s`;
  }

  // const scrollToQuestionnaires = () => {
  //   const section = document.getElementById("questionnaires");
  //   if (section) {
  //     section.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-neutral-400">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-300  ">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-white text-2xl">
            Projects <span className="text-[#F9B71E]">{" > "} </span>
            {project.title}
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
          </div>
        </div>

        {/* Right Column: Sidebar Card */}
        <div className="bg-[#252525] rounded-2xl p-8 flex flex-col h-fit">
          <h3 className="text-2xl font-bold text-white mb-4">
            {project.title}
          </h3>

          <div
            className="bg-[#333333] border border-gray-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative w-full"
            style={{ aspectRatio: "2 / 3" }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={project.title || "project image"}
                className="object-cover w-full h-full"
                onError={(e) => {
                  console.error("Project image failed to load:", imageSrc);
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="text-neutral-500 text-sm">No image</div>
            )}
          </div>

          <div className="text-sm leading-relaxed text-gray-400 mb-6">
            <p className="mb-4">{project.description || "No description."}</p>
          </div>

          {!project.isJoined ? (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="mt-auto w-full bg-[#F9B71E] hover:bg-[#c48e12] text-black py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg disabled:opacity-60"
            >
              {joining ? "Applying..." : "Apply to Join"}
            </button>
          ) : (
            <button
              onClick={() => setShowQuestionnairesModal(true)}
              className="mt-auto w-full bg-[#4c28a5] hover:bg-[#5d35c2] text-white py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg"
            >
              View Questionnaires
            </button>
          )}
        </div>
      </div>
      <OverlayModal
        isOpen={showQuestionnairesModal}
        onClose={() => setShowQuestionnairesModal(false)}
        title="Available Questionnaires"
      >
        <div className="space-y-4">
          {!project.isJoined ? (
            <div className="border border-gray-600 rounded-md p-6 text-sm text-gray-300">
              Apply to join this project to access its published questionnaires.
            </div>
          ) : project.questionnaires?.length ? (
            <div className="space-y-4">
              {project.questionnaires.map((questionnaire) => {
                const qid = questionnaire.id ?? questionnaire.questionnaireID;
                const resp = responsesMap[String(qid)];
                return (
                  <div
                    key={String(qid)}
                    className="border border-gray-700 rounded-lg p-4 bg-[#1e1e1e]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-white font-semibold">
                          {questionnaire.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {questionnaire.description || "No description."}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const started = await startQuestionnaireResponse(
                              project.projectID ?? project.id ?? id,
                              qid,
                              token,
                            );
                            navigate(`/projects/${id}/questionnaires/${qid}`, {
                              state: {
                                questionnaireResponseID: started.id,
                                startedAt: started.startedAt,
                              },
                            });
                            setShowQuestionnairesModal(false);
                          } catch (err) {
                            console.error("Failed to start questionnaire", err);
                            alert(
                              err?.message || "Failed to start questionnaire",
                            );
                          }
                        }}
                        disabled={questionnaire.hasSubmitted}
                        className="bg-[#F9B71E] text-black text-xs font-semibold px-4 py-2 rounded disabled:opacity-60"
                      >
                        {questionnaire.hasSubmitted ? "Completed" : "Start"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-3">
                      <span>
                        Duration:{" "}
                        {resp?.startedAt
                          ? fmtDurationWithSeconds(
                              resp.startedAt,
                              resp.submittedAt,
                            )
                          : questionnaire.startedAt
                            ? fmtDurationWithSeconds(
                                questionnaire.startedAt,
                                questionnaire.submittedAt,
                              )
                            : questionnaire.durationMinutes
                              ? `${questionnaire.durationMinutes} min`
                              : "N/A"}
                      </span>
                      <span>Points: {questionnaire.pointsReward ?? 0}</span>
                      <span>Status: {questionnaire.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-gray-600 rounded-md p-6 text-sm text-gray-300">
              No published questionnaires are available yet.
            </div>
          )}
        </div>
      </OverlayModal>
    </div>
  );
}

export default ProjectDetail;
