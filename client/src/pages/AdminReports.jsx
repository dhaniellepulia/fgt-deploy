import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/layouts/TopBar";
import OverlayModal from "../components/OverlayModal";
import { countries } from "../data/countries";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { request, authHeaders } from "../api/http";
import {
  fetchClientProjects,
  fetchProjectQuestionnaire,
} from "../api/projects";
import { useAuth } from "../auth/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const fmt = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const getCountryName = (code) => {
  if (!code) return "";
  const found = countries.find((c) => c.code === String(code).toUpperCase());
  return found ? found.name : code;
};

export default function AdminReports() {
  const { token } = useAuth();
  const [playtesters, setPlaytesters] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQ, setSelectedQ] = useState(null);
  const [responsesMap, setResponsesMap] = useState({});
  const [questionsMap, setQuestionsMap] = useState({});
  const [error, setError] = useState(null);
  const [playSortBy, setPlaySortBy] = useState("questionnaireID");
  const [playDirection, setPlayDirection] = useState("asc");
  const [clientSortBy, setClientSortBy] = useState("questionnaireID");
  const [clientDirection, setClientDirection] = useState("asc");

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      try {
        const headers = authHeaders(token);
        const pt = await request(`/admin/users?role=playtester`, {
          headers,
        }).then((b) => b.items || []);
        const cl = await request(`/admin/users?role=client`, {
          headers,
        }).then((b) => b.items || []);
        const projRes = await fetchClientProjects(token);
        const items = (projRes?.items || []).map((p) => ({
          projectID: Number(p.projectID || p.id || p.id),
          title: p.title,
          clientUserID: p.clientUserID ? Number(p.clientUserID) : null,
          clientName: p.clientName || p.client?.email || "",
          createdAt: p.createdAt,
          questionnaires: (p.questionnaires || [])
            .filter((q) => [1, 2].includes(Number(q.statusID)))
            .map((q) => ({
              questionnaireID: Number(q.questionnaireID ?? q.id ?? q.id),
              clientUserID:
                q.clientUserID !== undefined && q.clientUserID !== null
                  ? Number(q.clientUserID)
                  : null,
              title: q.title,
              description: q.description,
              startsAt: q.startsAt,
              endsAt: q.endsAt,
              timeLimitSeconds: q.timeLimitSeconds,
              maxResponses: q.maxResponses,
              pointsReward: q.pointsReward,
              createdAt: q.createdAt,
              statusID: q.statusID ?? null,
            })),
        }));

        if (!mounted) return;

        let finalItems = items;
        try {
          const allQs = await request("/questionnaires", { headers }).then(
            (r) => r.items || [],
          );

          const finalMap = new Map(
            items.map((p) => [
              String(p.projectID),
              { ...p, questionnaires: [...(p.questionnaires || [])] },
            ]),
          );

          const existingQIds = new Set(
            items.flatMap((p) =>
              (p.questionnaires || []).map((q) => String(q.questionnaireID)),
            ),
          );

          const uncategorized = [];

          (allQs || []).forEach((q) => {
            if (![1, 2].includes(Number(q.statusID))) return;
            const qid = String(q.questionnaireID ?? q.id ?? q.id);
            if (existingQIds.has(qid)) return;

            const projId = q.projectID ? String(q.projectID) : null;
            const qObj = {
              questionnaireID: Number(q.questionnaireID ?? q.id ?? q.id),
              clientUserID:
                q.clientUserID !== undefined && q.clientUserID !== null
                  ? Number(q.clientUserID)
                  : null,
              title: q.title,
              description: q.description,
              startsAt: q.startsAt,
              endsAt: q.endsAt,
              timeLimitSeconds: q.timeLimitSeconds,
              maxResponses: q.maxResponses,
              pointsReward: q.pointsReward,
              createdAt: q.createdAt,
              statusID: q.statusID ?? null,
            };

            if (projId && finalMap.has(projId)) {
              finalMap.get(projId).questionnaires.push(qObj);
            } else {
              uncategorized.push(qObj);
            }
          });

          let finalItemsFromMap = Array.from(finalMap.values());
          if (uncategorized.length) {
            finalItemsFromMap = [
              ...finalItemsFromMap,
              {
                projectID: "__unattached__",
                title: "Unattached / Missing Questionnaires",
                clientUserID: null,
                clientName: "",
                createdAt: null,
                questionnaires: uncategorized,
              },
            ];
          }

          finalItems = finalItemsFromMap;
        } catch (e) {
          console.warn("Failed to load global questionnaires", e);
        }

        setPlaytesters(pt);
        setClients(cl);
        setProjects(finalItems);

        const playQs = finalItems.flatMap((p) =>
          (p.questionnaires || [])
            .filter((q) => Number(q.statusID) === 2)
            .map((q) => ({
              projectID: p.projectID,
              questionnaireID: q.questionnaireID,
            })),
        );

        await Promise.all(
          playQs.map(async ({ projectID, questionnaireID }) => {
            const qid = Number(questionnaireID);
            try {
              let fetchedResponses = null;
              try {
                const adminResp = await request(
                  `/admin/questionnaires/${qid}/responses`,
                  { headers },
                );
                fetchedResponses =
                  adminResp?.items || adminResp?.responses || null;
              } catch (err) {
                if (projectID && projectID !== "__unattached__") {
                  try {
                    const pr = await request(
                      `/projects/${projectID}/questionnaires/${questionnaireID}/responses`,
                      { headers },
                    );
                    fetchedResponses = pr?.items || pr?.responses || pr || null;
                  } catch (err2) {
                    fetchedResponses = null;
                  }
                } else {
                  fetchedResponses = null;
                }
              }

              const normalized = Array.isArray(fetchedResponses)
                ? fetchedResponses
                    .map((r) => {
                      if (!r || !r.questionnaireResponseID) return null;
                      const answers = {};
                      if (Array.isArray(r.answers)) {
                        r.answers.forEach((a) => {
                          answers[a.questionID] =
                            a.answerText ??
                            a.answerNumber ??
                            a.answerDate ??
                            (a.selectedOption && a.selectedOption.optionText) ??
                            "";
                        });
                      }
                      return {
                        responderID: Number(r.questionnaireResponseID),
                        name: r.tester?.firstName
                          ? `${r.tester.firstName || ""} ${r.tester.lastName || ""}`.trim()
                          : r.tester?.email || `tester-${r.testerUserID}`,
                        submittedAt: r.submittedAt || r.createdAt,
                        answers,
                      };
                    })
                    .filter(Boolean)
                : [];

              if (!mounted) return;
              setResponsesMap((m) => ({ ...m, [qid]: normalized }));
            } catch (e) {
              if (!mounted) return;
              setResponsesMap((m) => ({ ...m, [qid]: [] }));
            }
          }),
        );

        setError(null);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => {
      mounted = false;
    };
  }, [token]);

  const questionnaires = useMemo(
    () =>
      projects.flatMap((p) =>
        (p.questionnaires || [])
          .filter((q) => [1, 2].includes(Number(q.statusID)))
          .map((q) => ({
            ...q,
            projectID: p.projectID,
            projectTitle: p.title,
            clientName: p.clientName,
            clientUserID:
              q.clientUserID !== undefined && q.clientUserID !== null
                ? Number(q.clientUserID)
                : null,
            userType: Number(q.statusID) === 2 ? "playtester" : "client",
          })),
      ),
    [projects],
  );

  const clientUserIdSet = useMemo(
    () =>
      new Set(
        (clients || [])
          .map((c) => c?.userID)
          .filter((id) => id !== undefined && id !== null)
          .map((id) => String(id)),
      ),
    [clients],
  );

  const playtesterQuestionnaires = questionnaires.filter(
    (q) => q.userType === "playtester",
  );
  const clientQuestionnaires = questionnaires.filter((q) =>
    q.clientUserID !== null && q.clientUserID !== undefined
      ? clientUserIdSet.has(String(q.clientUserID))
      : false,
  );

  const totalPlaytesters = playtesters.length;
  const totalClients = clients.length;
  const totalProjects = projects.length;

  const totalPlaytesterResponses = useMemo(() => {
    return questionnaires.reduce((sum, q) => {
      if (q.userType !== "playtester") return sum;
      const rid = Number(q.questionnaireID);
      return sum + (responsesMap[rid]?.length || 0);
    }, 0);
  }, [questionnaires, responsesMap]);

  const responsesByProject = useMemo(() => {
    return projects.map((p) => {
      const count = (p.questionnaires || []).reduce((sum, q) => {
        if (Number(q.statusID) !== 2) return sum;
        const rid = Number(q.questionnaireID);
        return sum + (responsesMap[rid]?.length || 0);
      }, 0);
      return { projectID: p.projectID, title: p.title, count };
    });
  }, [projects, responsesMap]);

  const chartData = responsesByProject.map((r) => ({
    name: r.title,
    count: r.count,
    projectID: r.projectID,
  }));

  const chartWidth =
    (chartData?.length || 0) > 0
      ? Math.max(600, chartData.length * 120)
      : "100%";

  const sortedPlaytesterQuestionnaires = useMemo(() => {
    const arr = Array.isArray(playtesterQuestionnaires)
      ? [...playtesterQuestionnaires]
      : [];
    const cmp = (a, b) => {
      const get = (it) => {
        switch (playSortBy) {
          case "title":
            return (it.title || "").toLowerCase();
          case "projectTitle":
            return (it.projectTitle || "").toLowerCase();
          case "createdAt":
            return it.createdAt ? new Date(it.createdAt).getTime() : 0;
          case "startsAt":
            return it.startsAt ? new Date(it.startsAt).getTime() : 0;
          default:
            return Number(it.questionnaireID || 0);
        }
      };
      const va = get(a),
        vb = get(b);
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      if (va < vb) return -1;
      if (va > vb) return 1;
      return 0;
    };
    arr.sort((a, b) => (playDirection === "asc" ? cmp(a, b) : -cmp(a, b)));
    return arr;
  }, [playtesterQuestionnaires, playSortBy, playDirection]);

  const sortedClientQuestionnaires = useMemo(() => {
    const arr = Array.isArray(clientQuestionnaires)
      ? [...clientQuestionnaires]
      : [];
    const cmp = (a, b) => {
      const get = (it) => {
        switch (clientSortBy) {
          case "title":
            return (it.title || "").toLowerCase();
          case "projectTitle":
            return (it.projectTitle || "").toLowerCase();
          case "createdAt":
            return it.createdAt ? new Date(it.createdAt).getTime() : 0;
          case "startsAt":
            return it.startsAt ? new Date(it.startsAt).getTime() : 0;
          default:
            return Number(it.questionnaireID || 0);
        }
      };
      const va = get(a),
        vb = get(b);
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      if (va < vb) return -1;
      if (va > vb) return 1;
      return 0;
    };
    arr.sort((a, b) => (clientDirection === "asc" ? cmp(a, b) : -cmp(a, b)));
    return arr;
  }, [clientQuestionnaires, clientSortBy, clientDirection]);

  const truncate = (s = "", n = 18) =>
    s.length > n ? `${s.slice(0, n - 1)}…` : s;

  async function loadQuestionnaireDetails(projectID, questionnaireID) {
    const qid = Number(questionnaireID);
    try {
      let qres;
      if (projectID) {
        qres = await fetchProjectQuestionnaire(
          projectID,
          questionnaireID,
          token,
        );
      } else {
        qres = await request(`/questionnaires/${questionnaireID}`, {
          headers: authHeaders(token),
        });
      }
      const questions = (qres?.item?.questions || qres?.questions || []).map(
        (qq) => ({
          id: qq.questionID ?? qq.id,
          text: qq.questionText ?? qq.text,
          type:
            qq.questionType?.typeCode || qq.questionType?.typeName || "TEXT",
          options: (qq.options || []).map(
            (o) => o.optionText || o.optionValue || o.text,
          ),
        }),
      );
      setQuestionsMap((m) => ({ ...m, [qid]: questions }));

      let fetchedResponses = null;
      try {
        const adminResp = await request(
          `/admin/questionnaires/${qid}/responses`,
          {
            headers: authHeaders(token),
          },
        );
        fetchedResponses = adminResp?.items || adminResp?.responses || null;
      } catch (err) {
        try {
          const pr = await request(
            `/projects/${projectID}/questionnaires/${questionnaireID}/responses`,
            { headers: authHeaders(token) },
          );
          fetchedResponses = pr?.items || pr?.responses || pr || null;
        } catch (err2) {
          fetchedResponses = null;
        }
      }

      if (fetchedResponses && Array.isArray(fetchedResponses)) {
        const normalized = fetchedResponses.map((r) => {
          if (r.questionnaireResponseID) {
            const answers = {};
            if (Array.isArray(r.answers)) {
              r.answers.forEach((a) => {
                answers[a.questionID] =
                  a.answerText ??
                  a.answerNumber ??
                  a.answerDate ??
                  (a.selectedOption && a.selectedOption.optionText) ??
                  "";
              });
            }
            return {
              responderID: Number(r.questionnaireResponseID),
              name: r.tester?.firstName
                ? `${r.tester.firstName || ""} ${r.tester.lastName || ""}`.trim()
                : r.tester?.email || `tester-${r.testerUserID}`,
              submittedAt: r.submittedAt || r.createdAt,
              answers,
            };
          }
          return r;
        });
        setResponsesMap((m) => ({ ...m, [qid]: normalized }));
      } else {
        setResponsesMap((m) => ({ ...m, [qid]: [] }));
      }
    } catch (err) {
      console.error("loadQuestionnaireDetails error", err);
      setQuestionsMap((m) => ({ ...m, [qid]: [] }));
      setResponsesMap((m) => ({ ...m, [qid]: [] }));
    }
  }

  const openQ = async (q) => {
    const qid = Number(q.questionnaireID);
    setSelectedQ(q);
    try {
      if (!questionsMap[qid]) {
        await loadQuestionnaireDetails(q.projectID, qid);
      }
    } catch (e) {
      console.error("openQ error", e);
    }
  };

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="flex w-full item-start justify-start lg:items-center lg:justify-between flex-col-reverse lg:flex-row py-5 lg:py-15 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[#F9B71E] font-bold text-2xl">Reports</h2>
        </div>
        <TopBar />
      </header>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="space-y-6">
        <section className="">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-8 bg-[#252525] rounded-lg border border-[#ffffff22] flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-[#4c9ef5] mb-2">
                {totalPlaytesters}
              </div>
              <div className="text-md text-neutral-200">Playtesters</div>
            </div>
            <div className="p-8 bg-[#252525] rounded-lg border border-[#ffffff22] flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-[#4c9ef5] mb-2">
                {totalClients}
              </div>
              <div className="text-md text-neutral-200">Clients</div>
            </div>
            <div className="p-8 bg-[#252525] rounded-lg border border-[#ffffff22] flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-[#4c9ef5] mb-2">
                {totalProjects}
              </div>
              <div className="text-md text-neutral-200">Projects</div>
            </div>
            <div className="p-8 bg-[#252525] rounded-lg border border-[#ffffff22] flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-[#4c9ef5] mb-2">
                {totalPlaytesterResponses}
              </div>
              <div className="text-md text-neutral-200">
                Total Playtester Responses
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-[#252525] p-8">
          <h4 className="text-white text-lg font-bold mb-4">
            Responses by Project
          </h4>

          <div className="overflow-x-auto">
            <div style={{ width: chartWidth, height: 300 }}>
              <BarChart
                width={chartWidth}
                height={300}
                data={chartData}
                margin={{ top: 16, right: 24, left: 0, bottom: 56 }}
              >
                <CartesianGrid stroke="#1c1c1c" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#cfcfcf" }}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => truncate(String(val), 18)}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: "#cfcfcf" }} tickLine={false} />
                <Tooltip
                  wrapperStyle={{
                    background: "#0b0b0b",
                    border: "1px solid #222",
                  }}
                  formatter={(value) => [value, "Responses"]}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="count"
                  fill="#4c9ef5"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-[#252525] p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
            <h4 className="text-white text-lg font-bold mb-4">
              Active Playtester Questionnaires
            </h4>

            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm text-gray-300 mr-2">Sort by</label>
              <div className="relative inline-block">
                <select
                  value={playSortBy}
                  onChange={(e) => setPlaySortBy(e.target.value)}
                  className="appearance-none bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 pr-8 focus:border-gray-600 focus:outline-0"
                >
                  <option value="questionnaireID">ID</option>
                  <option value="title">Title</option>
                  <option value="projectTitle">Project</option>
                  <option value="createdAt">Created</option>
                  <option value="startsAt">Schedule</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F9B71E] pointer-events-none"
                />
              </div>
              <button
                onClick={() =>
                  setPlayDirection((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="ml-2 p-2 bg-[#2a2a2a] rounded-md border border-gray-700 text-gray-300"
                title="Toggle sort direction"
              >
                {playDirection === "asc" ? (
                  <ChevronUp size={16} className="text-[#F9B71E]" />
                ) : (
                  <ChevronDown size={16} className="text-[#F9B71E]" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 px-4 mb-4 text-sm font-bold text-neutral-500 uppercase tracking-wide">
            <div className="col-span-1">ID</div>
            <div className="col-span-5 ">Title</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-3">Schedule</div>
          </div>

          <div className="space-y-2 overflow-x-scroll lg:overflow-hidden">
            <div className="space-y-2 w-max lg:w-full">
              {playtesterQuestionnaires.length === 0 && (
                <div className="text-gray-300">
                  No playtester questionnaires yet.
                </div>
              )}
              {sortedPlaytesterQuestionnaires.map((q) => (
                <div
                  key={q.questionnaireID}
                  role="button"
                  tabIndex={0}
                  onClick={() => openQ({ ...q, openedFrom: "playtester" })}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    openQ({ ...q, openedFrom: "playtester" })
                  }
                  className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F] cursor-pointer hover:shadow-lg hover:bg-gray-800"
                >
                  <div className="col-span-1 p-4 border-r border-[#ffffff49] bg-[#323232] text-neutral-300 font-medium whitespace-nowrap rounded-bl-lg rounded-tl-lg h-full flex items-center">
                    {q.questionnaireID}
                  </div>

                  <div className="col-span-5 p-4 text-neutral-300">
                    <div className="font-semibold text-white">{q.title}</div>
                  </div>

                  <div className="col-span-3 text-gray-300 text-sm">
                    {q.projectTitle}
                  </div>

                  <div className="col-span-3 text-gray-300 text-sm ">
                    {q.startsAt ? fmt(q.startsAt) : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-[#252525] p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
            <h4 className="text-white text-lg font-bold mb-4">
              Client Questionnaires
            </h4>

            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm text-gray-300 mr-2">Sort by</label>
              <div className="relative inline-block">
                <select
                  value={clientSortBy}
                  onChange={(e) => setClientSortBy(e.target.value)}
                  className="appearance-none bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 pr-8 focus:border-gray-600 focus:outline-0"
                >
                  <option value="questionnaireID">ID</option>
                  <option value="title">Title</option>
                  <option value="projectTitle">Project</option>
                  <option value="createdAt">Created</option>
                  <option value="startsAt">Created</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F9B71E] pointer-events-none"
                />
              </div>
              <button
                onClick={() =>
                  setClientDirection((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="ml-2 p-2 bg-[#2a2a2a] rounded-md border border-gray-700 text-gray-300"
                title="Toggle sort direction"
              >
                {clientDirection === "asc" ? (
                  <ChevronUp size={16} className="text-[#F9B71E]" />
                ) : (
                  <ChevronDown size={16} className="text-[#F9B71E]" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 px-4 mb-4 text-sm font-bold text-neutral-500 uppercase tracking-wide">
            <div className="col-span-1">ID</div>
            <div className="col-span-5 ">Title</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-3">Created</div>
          </div>

          <div className="space-y-2 overflow-x-scroll lg:overflow-hidden">
            <div className="space-y-2 w-max lg:w-full">
              {clientQuestionnaires.length === 0 && (
                <div className="text-gray-300">
                  No client questionnaires yet.
                </div>
              )}

              {sortedClientQuestionnaires.map((q) => (
                <div
                  key={q.questionnaireID}
                  role="button"
                  tabIndex={0}
                  onClick={() => openQ({ ...q, openedFrom: "client" })}
                  onKeyDown={(e) =>
                    e.key === "Enter" && openQ({ ...q, openedFrom: "client" })
                  }
                  className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F] cursor-pointer hover:shadow-lg hover:bg-gray-800 mb-2"
                >
                  <div className="col-span-1 p-4 border-r border-[#ffffff49] bg-[#323232] text-neutral-300 font-medium whitespace-nowrap rounded-bl-lg rounded-tl-lg h-full flex items-center">
                    {q.questionnaireID}
                  </div>

                  <div className="col-span-5 p-4 text-neutral-300">
                    <div className="font-semibold text-white">{q.title}</div>
                  </div>

                  <div className="col-span-3 text-gray-300 text-sm ">
                    {q.projectTitle}
                  </div>

                  <div className="col-span-3 text-gray-300 text-sm">
                    {q.createdAt ? fmt(q.createdAt) : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {selectedQ && (
        <OverlayModal
          isOpen={!!selectedQ}
          onClose={() => {
            setSelectedQ(null);
          }}
          title={`Questionnaire: ${selectedQ.title}`}
        >
          <div className="space-y-2 ">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-400">Project</div>
                <div className="font-semibold text-white">
                  {selectedQ.projectTitle}
                </div>
              </div>

              <div>
                <div className="text-sm text-neutral-400">Client</div>
                <div className="font-semibold text-white">
                  {selectedQ.clientName}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Description</div>
              <div className=" text-neutral-200 text-md">
                {selectedQ.description}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neutral-400">Created</div>
                <div className="font-semibold text-white">
                  {fmt(selectedQ.createdAt)}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400">Schedule</div>
                <div className="font-semibold text-white">
                  {selectedQ.startsAt ? fmt(selectedQ.startsAt) : "-"}
                  {selectedQ.endsAt ? ` - ${fmt(selectedQ.endsAt)}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400">Reward</div>
                <div className="font-semibold text-white">
                  {selectedQ.pointsReward ?? "-"} pts
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400">Capacity</div>
                <div className="font-semibold text-white">
                  {selectedQ.maxResponses ?? "-"}
                </div>
              </div>
            </div>

            <div>
              <div className="mt-5 text-md font-semibold text-neutral-200">
                Questions
              </div>
              <div className="mt-2 space-y-2">
                {(questionsMap[selectedQ.questionnaireID] || []).length ? (
                  (questionsMap[selectedQ.questionnaireID] || []).map(
                    (qq, idx) => (
                      <div
                        key={qq.id || idx}
                        className="p-3 bg-[#171717] rounded"
                      >
                        <div className="font-semibold text-white">
                          {idx + 1}. {qq.text}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {qq.type}
                          {qq.options?.length
                            ? `  ${qq.options.length} options`
                            : ""}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="text-gray-300">No questions loaded</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#ffffff10]">
              {selectedQ.userType === "playtester" &&
                selectedQ.openedFrom !== "client" && (
                  <div className="space-y-4">
                    <div className="mt-5 text-md font-semibold text-neutral-200">
                      Player Responses
                    </div>

                    {(responsesMap[selectedQ.questionnaireID] || []).length >
                    0 ? (
                      (responsesMap[selectedQ.questionnaireID] || []).map(
                        (resp) => (
                          <div
                            key={resp.responderID}
                            className="flex items-center justify-between p-3 bg-transparent border border-[#ffffff49] rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-[#323232] flex items-center justify-center text-white font-semibold text-sm">
                                {initials(resp.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {resp.name}
                                </div>
                                <div className="text-xs text-neutral-400">
                                  {fmt(resp.submittedAt)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedQ((s) => ({
                                    ...s,
                                    _viewResponse: resp,
                                  }));
                                }}
                                className="text-sm bg-[#1f5fe0] text-white px-3 py-1 rounded-md"
                              >
                                View full
                              </button>
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="text-gray-300">No responses yet.</div>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#ffffff10] flex justify-end">
            <button
              onClick={() => {
                setSelectedQ(null);
              }}
              aria-label="Close questionnaire modal"
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Close
            </button>
          </div>
        </OverlayModal>
      )}

      {selectedQ && selectedQ._viewResponse && (
        <OverlayModal
          isOpen={!!selectedQ._viewResponse}
          onClose={() =>
            setSelectedQ((s) => {
              const copy = { ...s };
              delete copy._viewResponse;
              return copy;
            })
          }
          title={`Response ${selectedQ._viewResponse.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#323232] flex items-center justify-center text-white font-semibold text-sm">
                {initials(selectedQ._viewResponse.name)}
              </div>
              <div>
                <div className="font-semibold text-white">
                  {selectedQ._viewResponse.name}
                </div>
                <div className="text-xs text-neutral-400">
                  {fmt(selectedQ._viewResponse.submittedAt)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {(questionsMap[selectedQ.questionnaireID] || []).map(
                (qq, idx) => (
                  <div
                    key={qq.id || idx}
                    className="p-3 bg-transparent border border-[#ffffff49] rounded-lg"
                  >
                    <div className="text-xs text-neutral-400">{qq.type}</div>
                    <div className="mt-1 font-medium text-white">
                      Q{idx + 1}: {qq.text}
                    </div>
                    <div className="mt-2 text-md text-gray-300">
                      A: {(selectedQ._viewResponse.answers || {})[qq.id] || "-"}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="pt-4 border-t border-[#ffffff10] flex justify-end">
              <button
                onClick={() =>
                  setSelectedQ((s) => {
                    const copy = { ...s };
                    delete copy._viewResponse;
                    return copy;
                  })
                }
                aria-label="Close response modal"
                className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </OverlayModal>
      )}
    </div>
  );
}
