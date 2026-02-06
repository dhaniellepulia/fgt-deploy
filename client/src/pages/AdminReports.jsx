import React, { useMemo, useState } from "react";
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

// Mock data
const initialPlaytesters = [
  {
    userID: 1,
    email: "tester1@example.com",
    firstName: "Sample",
    lastName: "1",
    countryResidenceCode: "PH",
  },
  {
    userID: 2,
    email: "tester2@example.com",
    firstName: "Sample",
    lastName: "2",
    countryResidenceCode: "KR",
  },
  {
    userID: 3,
    email: "tester3@example.com",
    firstName: "Sample",
    lastName: "3",
    countryResidenceCode: "JP",
  },
  {
    userID: 4,
    email: "tester4@example.com",
    firstName: "Sample",
    lastName: "4",
    countryResidenceCode: "CN",
  },
];

const initialClients = [
  {
    userID: 101,
    email: "client1@example.com",
    firstName: "Sample",
    lastName: "1",
    countryResidenceCode: "GB",
  },
  {
    userID: 102,
    email: "client2@example.com",
    firstName: "Sample",
    lastName: "2",
    countryResidenceCode: "US",
  },
];

const initialProjects = [
  {
    projectID: 101,
    title: "Sample Project 1",
    clientName: "Sample Client",
    createdAt: new Date("2026-01-05T10:00:00Z"),
    questionnaires: [
      {
        questionnaireID: 201,
        userType: "playtester",
        title: "Sample Title",
        description: "Sample description",
        startsAt: new Date("2026-02-10T00:00:00Z"),
        endsAt: new Date("2026-02-24T00:00:00Z"),
        timeLimitSeconds: 600,
        maxResponses: 500,
        pointsReward: 50,
        createdAt: new Date("2026-01-10T08:00:00Z"),
        questions: [
          {
            id: "q1",
            text: "Overall handling satisfaction",
            type: "single",
            options: [
              "Very dissatisfied",
              "Dissatisfied",
              "Neutral",
              "Satisfied",
              "Very satisfied",
            ],
          },
          {
            id: "q2",
            text: "Was the difficulty appropriate?",
            type: "single",
            options: ["Too easy", "Fine", "Too hard"],
          },
          {
            id: "q3",
            text: "Rate controls responsiveness (1-5)",
            type: "scale",
            options: ["1", "2", "3", "4", "5"],
          },
          {
            id: "q4",
            text: "Which platform did you use?",
            type: "single",
            options: ["PC", "Console", "Mobile"],
          },
          {
            id: "q5",
            text: "Report any bugs you encountered",
            type: "text",
            options: [],
          },
          {
            id: "q6",
            text: "What did you like most?",
            type: "text",
            options: [],
          },
          {
            id: "q7",
            text: "Would you recommend this to friends?",
            type: "single",
            options: ["Yes", "No"],
          },
          {
            id: "q8",
            text: "Optional additional comments",
            type: "text",
            options: [],
          },
        ],
      },
      {
        questionnaireID: 301,
        userType: "client",
        title: "Sample Title",
        description: "Sample description for client questionnaire.",
        startsAt: new Date("2026-02-10T00:00:00Z"),
        endsAt: new Date("2026-02-24T00:00:00Z"),
        timeLimitSeconds: 600,
        maxResponses: 500,
        pointsReward: 50,
        createdAt: new Date("2026-01-11T10:00:00Z"),
        questions: [
          { id: "c1", text: "Key concerns (short)", type: "text", options: [] },
          { id: "c2", text: "Priority fixes", type: "text", options: [] },
          {
            id: "c3",
            text: "Release target (notes)",
            type: "text",
            options: [],
          },
        ],
      },
    ],
  },
  {
    projectID: 102,
    title: "Sample Project 2",
    clientName: "Sample Client 2",
    createdAt: new Date("2025-12-12T14:30:00Z"),
    questionnaires: [
      {
        questionnaireID: 202,
        userType: "playtester",
        title: "Sample Title",
        description: "Sample description",
        startsAt: new Date("2025-12-20T00:00:00Z"),
        endsAt: new Date("2026-01-20T00:00:00Z"),
        timeLimitSeconds: 900,
        maxResponses: 300,
        pointsReward: 40,
        createdAt: new Date("2025-12-12T14:30:00Z"),
        questions: [
          {
            id: "q1",
            text: "Enjoyment level",
            type: "single",
            options: ["Low", "Medium", "High"],
          },
          {
            id: "q2",
            text: "Found major bugs?",
            type: "single",
            options: ["Yes", "No"],
          },
          {
            id: "q3",
            text: "Main improvement suggestion",
            type: "text",
            options: [],
          },
        ],
      },
    ],
  },
  {
    projectID: 103,
    title: "Sample Project 3",
    clientName: "Sample Client 3",
    createdAt: new Date("2026-01-20T09:15:00Z"),
    questionnaires: [],
  },
];

const mockResponses = {
  201: [
    {
      responderID: 1,
      name: "Sample 1",
      submittedAt: new Date("2026-02-11T09:00:00Z"),
      answers: {
        q1: "Satisfied",
        q2: "Fine",
        q3: "4",
        q4: "PC",
        q5: "Great",
        q6: "Great",
        q7: "Yes",
        q8: "Enjoyed it overall",
      },
    },
    {
      responderID: 2,
      name: "Sample 2",
      submittedAt: new Date("2026-02-12T14:10:00Z"),
      answers: {
        q1: "Very satisfied",
        q2: "Fine",
        q3: "5",
        q4: "PC",
        q5: "",
        q6: "Great",
        q7: "Yes",
        q8: "",
      },
    },
  ],
  202: [
    {
      responderID: 3,
      name: "Sample 3",
      submittedAt: new Date("2025-12-22T07:30:00Z"),
      answers: { q1: "Medium", q2: "Yes", q3: "Improve tutorial" },
    },
  ],
};

export default function AdminReports() {
  const [projects] = useState(initialProjects);
  const [playtesters] = useState(initialPlaytesters);
  const [clients] = useState(initialClients);

  const questionnaires = useMemo(
    () =>
      projects.flatMap((p) =>
        (p.questionnaires || []).map((q) => ({
          ...(q || {}),
          userType: q?.userType || "playtester",
          projectID: p.projectID,
          projectTitle: p.title,
          clientName: p.clientName,
        })),
      ),
    [projects],
  );

  const playtesterQuestionnaires = questionnaires.filter(
    (q) => q.userType === "playtester",
  );
  const clientQuestionnaires = questionnaires.filter(
    (q) => q.userType === "client",
  );

  const totalPlaytesters = playtesters.length;
  const totalClients = clients.length;
  const totalProjects = projects.length;
  const totalResponses = questionnaires.reduce(
    (s, q) => s + (q.maxResponses || 0),
    0,
  );

  const [selectedQ, setSelectedQ] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const responsesByProject = useMemo(() => {
    const rows = projects.map((p) => {
      const count = (p.questionnaires || []).reduce((sum, q) => {
        if (q.userType !== "playtester") return sum;
        return sum + (mockResponses[q.questionnaireID] || []).length;
      }, 0);
      return { projectID: p.projectID, title: p.title, count };
    });
    return rows;
  }, [projects]);

  const chartData = useMemo(
    () =>
      responsesByProject.map((r) => ({
        name: r.title,
        count: r.count,
        projectID: r.projectID,
      })),
    [responsesByProject],
  );

  const truncate = (s = "", n = 18) =>
    s.length > n ? `${s.slice(0, n - 1)}…` : s;

  const openQ = (q) => {
    setSelectedQ(q);
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
                {totalResponses}
              </div>
              <div className="text-md text-neutral-200">
                Total Responses (capacity)
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-[#252525] p-8">
          <h4 className="text-white text-lg font-bold mb-4">
            Responses by Project
          </h4>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl bg-[#252525] p-8">
          <h4 className="text-white text-lg font-bold mb-4">
            Playtester Questionnaires
          </h4>

          <div className="grid grid-cols-12 px-4 mb-4 text-sm font-bold text-neutral-500 uppercase tracking-wide">
            <div className="col-span-1">ID</div>
            <div className="col-span-5 ">Title</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-3">Schedule</div>
          </div>

          <div className="space-y-2 overflow-x-scroll lg:overflow-hidden">
            <div className="space-y-2 w-max lg:w-full">
              {" "}
              {playtesterQuestionnaires.length === 0 && (
                <div className="text-gray-300">
                  No playtester questionnaires yet.
                </div>
              )}
              {playtesterQuestionnaires.map((q) => (
                <div
                  key={q.questionnaireID}
                  role="button"
                  tabIndex={0}
                  onClick={() => openQ(q)}
                  onKeyDown={(e) => e.key === "Enter" && openQ(q)}
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
          <h4 className="text-white text-lg font-bold mb-4">
            Client Questionnaires
          </h4>

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

              {clientQuestionnaires.map((q) => (
                <div
                  key={q.questionnaireID}
                  role="button"
                  tabIndex={0}
                  onClick={() => openQ(q)}
                  onKeyDown={(e) => e.key === "Enter" && openQ(q)}
                  className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F] cursor-pointer hover:shadow-lg hover:bg-gray-800"
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
            setSelectedResponse(null);
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
                {selectedQ.questions?.length ? (
                  selectedQ.questions.map((qq, idx) => (
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
                  ))
                ) : (
                  <div className="text-gray-300">No questions</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#ffffff10]">
              {selectedQ.userType === "playtester" && (
                <div className="space-y-4">
                  <div className="mt-5 text-md font-semibold text-neutral-200">
                    Player Responses
                  </div>

                  {(mockResponses[selectedQ.questionnaireID] || []).map(
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
                            onClick={() => setSelectedResponse(resp)}
                            className="text-sm bg-[#1f5fe0] text-white px-3 py-1 rounded-md"
                          >
                            View full
                          </button>
                        </div>
                      </div>
                    ),
                  )}

                  {(mockResponses[selectedQ.questionnaireID] || []).length ===
                    0 && (
                    <>
                      <div className="text-gray-300">
                        No responses yet. Eligible playtesters:
                      </div>
                      <div className="space-y-2">
                        {playtesters.map((u) => (
                          <div
                            key={u.userID}
                            className="flex items-center justify-between p-3 bg-transparent border border-[#ffffff49] rounded-lg"
                          >
                            <div>
                              <div className="font-semibold text-white">
                                {u.firstName} {u.lastName}
                              </div>
                              <div className="text-sm text-neutral-400">
                                {u.email}{" "}
                                {getCountryName(u.countryResidenceCode)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-300">
                              Eligible
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#ffffff10] flex justify-end">
            <button
              onClick={() => {
                setSelectedQ(null);
                setSelectedResponse(null);
              }}
              aria-label="Close questionnaire modal"
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Close
            </button>
          </div>
        </OverlayModal>
      )}

      {selectedResponse && selectedQ && (
        <OverlayModal
          isOpen={!!selectedResponse}
          onClose={() => setSelectedResponse(null)}
          title={`Response  ${selectedResponse.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#323232] flex items-center justify-center text-white font-semibold text-sm">
                {initials(selectedResponse.name)}
              </div>
              <div>
                <div className="font-semibold text-white">
                  {selectedResponse.name}
                </div>
                <div className="text-xs text-neutral-400">
                  {fmt(selectedResponse.submittedAt)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedQ.questions?.length ? (
                selectedQ.questions.map((qq, idx) => (
                  <div
                    key={qq.id || idx}
                    className="p-3 bg-transparent border border-[#ffffff49] rounded-lg"
                  >
                    <div className="text-xs text-neutral-400">{qq.type}</div>
                    <div className="mt-1 font-medium text-white">
                      Q{idx + 1}: {qq.text}
                    </div>
                    <div className="mt-2 text-md text-gray-300">
                      A: {(selectedResponse.answers || {})[qq.id] || "-"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-300">No questions</div>
              )}
            </div>

            <div className="pt-4 border-t border-[#ffffff10] flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
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
