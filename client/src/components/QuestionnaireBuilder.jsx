import React, { useEffect, useState } from "react";
import {
  createQuestionnaire,
  updateQuestionnaire,
  addQuestion,
  addQuestionOption,
  fetchQuestionnaire,
} from "../api/questionnaires";

const questionTypes = [
  { id: 1, label: "Short Answer" },
  { id: 2, label: "Paragraph" },
  { id: 3, label: "Single Choice (Dropdown)" },
  { id: 4, label: "Checkboxes (Multiple Choice)" },
  { id: 5, label: "Likert Scale" },
  { id: 6, label: "Number" },
  { id: 7, label: "Date" },
];

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

const getQuestionTypeLabel = (id) => {
  const found = questionTypes.find((t) => Number(t.id) === Number(id));
  return found ? found.label : `Type ${id}`;
};

const uid = (prefix = "q") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export default function QuestionnaireBuilder({
  token,
  projectID,
  initialQuestionnaire = null,
  onSaved = () => {},
  onCancel = () => {},
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsReward, setPointsReward] = useState(0);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState("");
  const [maxResponses, setMaxResponses] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialQuestionnaire) {
      resetBuilder();
      return;
    }
    setTitle(initialQuestionnaire.title || "");
    setDescription(initialQuestionnaire.description || "");
    setPointsReward(initialQuestionnaire.pointsReward || 0);
    setTimeLimitSeconds(initialQuestionnaire.timeLimitSeconds ?? "");
    setMaxResponses(initialQuestionnaire.maxResponses ?? "");
    setStartsAt(
      initialQuestionnaire.startsAt
        ? initialQuestionnaire.startsAt.slice(0, 16)
        : "",
    );
    setEndsAt(
      initialQuestionnaire.endsAt
        ? initialQuestionnaire.endsAt.slice(0, 16)
        : "",
    );
    setQuestions(
      (initialQuestionnaire.questions || []).map((q) => ({
        localId: q.questionID ? `srv_${q.questionID}` : uid(),
        questionID: q.questionID,
        text: q.questionText || q.text || "",
        questionTypeID: q.questionTypeID ?? (q.type ? mapQType(q.type) : 1),
        options: (q.options || []).map((opt) => ({
          id: opt.questionOptionID ?? uid("opt"),
          text: opt.optionText || opt.text || "",
          questionOptionID: opt.questionOptionID,
        })),
        displayOrder: q.displayOrder ?? 1,
      })),
    );
  }, [initialQuestionnaire]);

  function resetBuilder() {
    setTitle("");
    setDescription("");
    setPointsReward(0);
    setTimeLimitSeconds("");
    setMaxResponses("");
    setStartsAt("");
    setEndsAt("");
    setQuestions([]);
  }

  const addLocalQuestion = () => {
    setQuestions((s) => [
      ...s,
      {
        localId: uid(),
        text: "",
        questionTypeID: 3,
        options: [
          { id: uid("opt"), text: "" },
          { id: uid("opt"), text: "" },
        ],
        displayOrder: (s.length || 0) + 1,
      },
    ]);
  };

  const removeLocalQuestion = (localId) =>
    setQuestions((s) => s.filter((q) => q.localId !== localId));

  const updateLocalQuestion = (localId, patch) =>
    setQuestions((s) =>
      s.map((q) => (q.localId === localId ? { ...q, ...patch } : q)),
    );

  const addLocalOption = (localId) =>
    setQuestions((s) =>
      s.map((q) =>
        q.localId === localId
          ? {
              ...q,
              options: [...(q.options || []), { id: uid("opt"), text: "" }],
            }
          : q,
      ),
    );

  const updateLocalOption = (localId, optId, text) =>
    setQuestions((s) =>
      s.map((q) =>
        q.localId === localId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optId ? { ...o, text } : o,
              ),
            }
          : q,
      ),
    );

  const removeLocalOption = (localId, optId) =>
    setQuestions((s) =>
      s.map((q) =>
        q.localId === localId
          ? { ...q, options: q.options.filter((o) => o.id !== optId) }
          : q,
      ),
    );

  const buildPreparedQuestions = () =>
    questions.map((q) => ({
      id: q.localId,
      text: q.text || "Untitled question",
      type:
        q.questionTypeID === 3
          ? "single"
          : q.questionTypeID === 4
            ? "multiple"
            : "text",
      options: (q.options || [])
        .map((o) => String(o.text || "").trim())
        .filter(Boolean),
      displayOrder: q.displayOrder ?? 1,
    }));

  const handleSave = async () => {
    if (!token) {
      alert("Not authenticated");
      return;
    }
    setSaving(true);
    try {
      const preparedQuestions = buildPreparedQuestions();
      const qNextID =
        Math.max(
          0,
          ...(questions || []).map((q) => Number(q.questionID || 0)),
        ) + 1;
      const payload = {
        questionnaireID: initialQuestionnaire?.questionnaireID ?? qNextID,
        title:
          title ||
          `Questionnaire ${initialQuestionnaire?.questionnaireID ?? qNextID}`,
        description: description || "",
        statusID: 1,
        publishedAt: null,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        timeLimitSeconds: timeLimitSeconds ? Number(timeLimitSeconds) : null,
        maxResponses: maxResponses ? Number(maxResponses) : null,
        pointsReward: Number(pointsReward) || 0,
        createdAt: new Date().toISOString(),
        questions: preparedQuestions,
        projectID,
      };

      let res;
      if (initialQuestionnaire?.questionnaireID) {
        res = await updateQuestionnaire(
          initialQuestionnaire.questionnaireID,
          token,
          payload,
        );
      } else {
        res = await createQuestionnaire(token, payload);
      }

      const qResRaw = res?.item || res?.questionnaire || res || payload;
      const questionnaireId =
        qResRaw.questionnaireID ?? qResRaw.id ?? payload.questionnaireID;

      if (Array.isArray(preparedQuestions) && preparedQuestions.length > 0) {
        const hasQuestionsOnRes =
          Array.isArray(qResRaw.questions) && qResRaw.questions.length > 0;
        if (!hasQuestionsOnRes) {
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
        }
      }

      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      const full = refreshed?.item || refreshed || null;
      if (full) {
        onSaved(full);
      } else {
        onSaved(qResRaw);
      }
    } catch (err) {
      console.error("Questionnaire save failed", err);
      alert(err.message || "Failed to save questionnaire");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-neutral-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-neutral-400">Points Reward</label>
          <input
            type="number"
            value={pointsReward}
            onChange={(e) => setPointsReward(e.target.value)}
            className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Time Limit (s)</label>
          <input
            type="number"
            value={timeLimitSeconds}
            onChange={(e) => setTimeLimitSeconds(e.target.value)}
            className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Max Responses</label>
          <input
            type="number"
            value={maxResponses}
            onChange={(e) => setMaxResponses(e.target.value)}
            className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-neutral-400">Starts At</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Ends At</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
          />
        </div>
      </div>

      <div className="border-t border-[#ffffff10] p-5 bg-[#1b1b1b]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white font-semibold">Questions</div>
          <div>
            <button
              onClick={addLocalQuestion}
              className="bg-[#2a2a2a] px-3 py-1 rounded text-sm text-gray-300"
            >
              Add Question
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((qq, idx) => (
            <div
              key={qq.localId}
              className="p-3 border border-[#ffffff14] rounded"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Question {idx + 1}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <div className="text-xs bg-[#2a2a2a] px-2 py-1 rounded text-gray-300">
                      {getQuestionTypeLabel(qq.questionTypeID)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeLocalQuestion(qq.localId)}
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
                    updateLocalQuestion(qq.localId, { text: e.target.value })
                  }
                  className="w-full p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-2">
                <select
                  value={qq.questionTypeID}
                  onChange={(e) =>
                    updateLocalQuestion(qq.localId, {
                      questionTypeID: Number(e.target.value),
                    })
                  }
                  className="p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                >
                  {questionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <div />
                <div />
              </div>

              {(Number(qq.questionTypeID) === 3 ||
                Number(qq.questionTypeID) === 4) && (
                <div>
                  <div className="text-xs text-neutral-400 mb-1">Options</div>
                  <div className="space-y-2">
                    {(qq.options || []).map((opt) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          value={opt.text}
                          onChange={(e) =>
                            updateLocalOption(
                              qq.localId,
                              opt.id,
                              e.target.value,
                            )
                          }
                          className="flex-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                        />
                        <button
                          onClick={() => removeLocalOption(qq.localId, opt.id)}
                          className="px-2 py-1 bg-[#2a2a2a] rounded text-sm text-red-400"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addLocalOption(qq.localId)}
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
          onClick={onCancel}
          className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
        >
          {saving ? "Saving..." : "Save Questionnaire"}
        </button>
      </div>
    </div>
  );
}
