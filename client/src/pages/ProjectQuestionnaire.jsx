import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";
import {
  fetchProjectQuestionnaire,
  submitProjectQuestionnaireResponse,
} from "../api/projects";
import { useAuth } from "../auth/AuthContext";

function ProjectQuestionnaire() {
  const { projectId, questionnaireId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchProjectQuestionnaire(
          projectId,
          questionnaireId,
          token
        );
        if (mounted) {
          setQuestionnaire(res.item);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load questionnaire");
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
  }, [projectId, questionnaireId, token]);

  const updateAnswer = (questionID, update) => {
    setAnswers((prev) => ({
      ...prev,
      [questionID]: {
        ...(prev[questionID] || {}),
        ...update,
      },
    }));
  };

  const orderedQuestions = useMemo(() => {
    if (!questionnaire?.questions) return [];
    return [...questionnaire.questions].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  }, [questionnaire]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!questionnaire) return;

    try {
      setSaving(true);
      setError("");

      const payloadAnswers = [];
      for (const question of orderedQuestions) {
        const response = answers[question.questionID] || {};
        const typeCode = question.questionType?.typeCode;

        if (typeCode === "SHORT_TEXT" || typeCode === "LONG_TEXT") {
          const value = (response.answerText || "").trim();
          if (!value) {
            if (question.isRequired) {
              throw new Error("Please answer all required questions.");
            }
            continue;
          }
          payloadAnswers.push({
            questionID: question.questionID,
            answerText: value,
          });
        } else if (typeCode === "NUMBER" || typeCode === "SCALE") {
          if (
            response.answerNumber === undefined ||
            response.answerNumber === null ||
            response.answerNumber === ""
          ) {
            if (question.isRequired) {
              throw new Error("Please answer all required questions.");
            }
            continue;
          }
          payloadAnswers.push({
            questionID: question.questionID,
            answerNumber: response.answerNumber,
          });
        } else if (typeCode === "DATE") {
          if (!response.answerDate) {
            if (question.isRequired) {
              throw new Error("Please answer all required questions.");
            }
            continue;
          }
          payloadAnswers.push({
            questionID: question.questionID,
            answerDate: response.answerDate,
          });
        } else if (typeCode === "SINGLE_CHOICE") {
          if (!response.selectedOptionID) {
            if (question.isRequired) {
              throw new Error("Please answer all required questions.");
            }
            continue;
          }
          payloadAnswers.push({
            questionID: question.questionID,
            selectedOptionID: response.selectedOptionID,
            otherText: response.otherText || null,
          });
        } else if (typeCode === "MULTI_CHOICE") {
          const selectedOptionIDs = Array.isArray(response.selectedOptionIDs)
            ? response.selectedOptionIDs
            : [];
          if (!selectedOptionIDs.length) {
            if (question.isRequired) {
              throw new Error("Please answer all required questions.");
            }
            continue;
          }
          payloadAnswers.push({
            questionID: question.questionID,
            selectedOptionIDs,
            otherText: response.otherText || null,
          });
        } else {
          const value = (response.answerText || "").trim();
          if (!value) {
            if (question.isRequired) {
              throw new Error("Please answer all required questions.");
            }
            continue;
          }
          payloadAnswers.push({
            questionID: question.questionID,
            answerText: value,
          });
        }
      }

      await submitProjectQuestionnaireResponse(
        projectId,
        questionnaireId,
        token,
        { answers: payloadAnswers }
      );
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.message || "Failed to submit questionnaire");
    } finally {
      setSaving(false);
    }
  };

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

  if (!questionnaire) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-neutral-400">Questionnaire not found.</p>
      </div>
    );
  }

  if (questionnaire.hasSubmitted) {
    return (
      <div className="min-h-screen text-gray-300">
        <header className="flex w-full items-center justify-between py-15 gap-4">
          <div>
            <h3 className="text-[#F9B71E] font-bold text-2xl">
              {questionnaire.title}
            </h3>
          </div>
          <TopBar />
        </header>
        <div className="bg-[#252525] rounded-xl p-8">
          <p className="text-sm text-gray-300">
            You have already completed this questionnaire.
          </p>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mt-6 bg-[#F9B71E] text-black text-sm font-semibold px-6 py-2 rounded"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-300">
      <header className="flex w-full items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] font-bold text-2xl">
            {questionnaire.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {questionnaire.description || "Answer the questions below."}
          </p>
        </div>
        <TopBar />
      </header>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#1e1e1e] rounded-xl overflow-hidden"
      >
        <div className="p-8 space-y-8 bg-[#252525]">
          {orderedQuestions.map((question, index) => {
            const response = answers[question.questionID] || {};
            const typeCode = question.questionType?.typeCode;

            return (
              <section key={question.questionID} className="space-y-4">
                <div>
                  <h4 className="text-lg text-white">
                    {index + 1}. {question.questionText}
                    {question.isRequired && (
                      <span className="text-red-500 ml-2">*</span>
                    )}
                  </h4>
                  {question.helpText && (
                    <p className="text-sm text-gray-400 mt-1">
                      {question.helpText}
                    </p>
                  )}
                </div>

                {(typeCode === "SHORT_TEXT" || typeCode === "LONG_TEXT") && (
                  <textarea
                    value={response.answerText || ""}
                    onChange={(event) =>
                      updateAnswer(question.questionID, {
                        answerText: event.target.value,
                      })
                    }
                    rows={typeCode === "LONG_TEXT" ? 4 : 2}
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 text-sm"
                  />
                )}

                {(typeCode === "NUMBER" || typeCode === "SCALE") && (
                  <input
                    type="number"
                    min={question.minValue ?? undefined}
                    max={question.maxValue ?? undefined}
                    step={question.stepValue ?? undefined}
                    value={response.answerNumber ?? ""}
                    onChange={(event) =>
                      updateAnswer(question.questionID, {
                        answerNumber: event.target.value,
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 text-sm"
                  />
                )}

                {typeCode === "DATE" && (
                  <input
                    type="date"
                    value={response.answerDate || ""}
                    onChange={(event) =>
                      updateAnswer(question.questionID, {
                        answerDate: event.target.value,
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 text-sm"
                  />
                )}

                {typeCode === "SINGLE_CHOICE" && (
                  <div className="space-y-3">
                    {question.options?.map((option) => (
                      <label
                        key={option.questionOptionID}
                        className="flex items-center gap-3 text-sm"
                      >
                        <input
                          type="radio"
                          name={`question-${question.questionID}`}
                          checked={
                            response.selectedOptionID === option.questionOptionID
                          }
                          onChange={() =>
                            updateAnswer(question.questionID, {
                              selectedOptionID: option.questionOptionID,
                            })
                          }
                          className="accent-[#F9B71E]"
                        />
                        <span>{option.optionText}</span>
                      </label>
                    ))}
                    {question.options?.some((opt) => opt.isOtherOption) &&
                      response.selectedOptionID &&
                      question.options.find(
                        (opt) => opt.questionOptionID === response.selectedOptionID
                      )?.isOtherOption && (
                        <input
                          type="text"
                          value={response.otherText || ""}
                          onChange={(event) =>
                            updateAnswer(question.questionID, {
                              otherText: event.target.value,
                            })
                          }
                          placeholder="Please specify"
                          className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-2 text-sm"
                        />
                      )}
                  </div>
                )}

                {typeCode === "MULTI_CHOICE" && (
                  <div className="space-y-3">
                    {question.options?.map((option) => {
                      const selected = Array.isArray(response.selectedOptionIDs)
                        ? response.selectedOptionIDs.includes(
                            option.questionOptionID
                          )
                        : false;

                      return (
                        <label
                          key={option.questionOptionID}
                          className="flex items-center gap-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              const current = Array.isArray(
                                response.selectedOptionIDs
                              )
                                ? response.selectedOptionIDs
                                : [];
                              const next = event.target.checked
                                ? [...current, option.questionOptionID]
                                : current.filter(
                                    (id) => id !== option.questionOptionID
                                  );
                              updateAnswer(question.questionID, {
                                selectedOptionIDs: next,
                              });
                            }}
                            className="accent-[#F9B71E]"
                          />
                          <span>{option.optionText}</span>
                        </label>
                      );
                    })}
                    {question.options?.some((opt) => opt.isOtherOption) &&
                      Array.isArray(response.selectedOptionIDs) &&
                      response.selectedOptionIDs.some((optionID) =>
                        question.options.find(
                          (opt) => opt.questionOptionID === optionID
                        )?.isOtherOption
                      ) && (
                        <input
                          type="text"
                          value={response.otherText || ""}
                          onChange={(event) =>
                            updateAnswer(question.questionID, {
                              otherText: event.target.value,
                            })
                          }
                          placeholder="Please specify"
                          className="w-full bg-[#1e1e1e] border border-gray-700 rounded p-2 text-sm"
                        />
                      )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="p-6 flex items-center justify-between bg-[#252525]">
          <span className="text-xs text-gray-400">
            {orderedQuestions.length} questions
          </span>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F9B71E] text-black text-sm font-semibold px-8 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit Questionnaire"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectQuestionnaire;
