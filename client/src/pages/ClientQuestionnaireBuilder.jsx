import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";
import { useAuth } from "../auth/AuthContext";
import { countries } from "../data/countries";
import { fetchGenres, fetchGames } from "../api/metadata";
import { Trash2, ChevronLeft, Edit } from "lucide-react";
import {
  addQuestion,
  addQuestionOption,
  deleteQuestion,
  deleteQuestionOption,
  deleteQuestionnaire,
  fetchQuestionnaire,
  updateQuestion,
  updateQuestionnaire,
  updateQuestionnaireCriteria,
  updateQuestionOption,
} from "../api/questionnaires";
import MultiSelect from "../components/MultiSelect.jsx";
import Select from "../components/Select.jsx";
const questionTypes = [
  { id: 1, label: "Short Answer" },
  { id: 2, label: "Paragraph" },
  { id: 3, label: "Single Choice (Dropdown)" },
  { id: 4, label: "Checkboxes (Multiple Choice)" },
  { id: 5, label: "Likert Scale" },
  { id: 6, label: "Number" },
  { id: 7, label: "Date" },
];

function ClientQuestionnaireBuilder() {
  const { projectId, questionnaireId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [genres, setGenres] = useState([]);
  const [games, setGames] = useState([]);
  const [saving, setSaving] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    questionTypeID: 1,
    questionText: "",
    helpText: "",
    isRequired: false,
    displayOrder: 1,
    options: "",
    newOptions: "",
    minSelections: "",
    maxSelections: "",
    minValue: "",
    maxValue: "",
    stepValue: "",
    placeholderText: "",
  });
  const [editingQuestionID, setEditingQuestionID] = useState(null);
  const [criteria, setCriteria] = useState({
    gender: { matchType: "Priority", values: [] },
    age: { matchType: "Priority", min: "", max: "" },
    location: { matchType: "Priority", values: [] },
    language: { matchType: "Priority", values: [] },
    preferredGenre: { matchType: "Priority", values: [] },
    recentGame: { matchType: "Priority", values: [] },
  });
  const [questionnaireForm, setQuestionnaireForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    timeLimitSeconds: "",
    maxResponses: "",
    statusID: 1,
  });
  const [optionDrafts, setOptionDrafts] = useState({});
  const [newOptionDrafts, setNewOptionDrafts] = useState({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetchQuestionnaire(questionnaireId, token);
        if (mounted) {
          setQuestionnaire(res.item);
          setQuestionForm((prev) => ({
            ...prev,
            displayOrder: (res.item.questions?.length || 0) + 1,
          }));
          setQuestionnaireForm({
            title: res.item.title || "",
            description: res.item.description || "",
            startsAt: res.item.startsAt ? res.item.startsAt.slice(0, 16) : "",
            endsAt: res.item.endsAt ? res.item.endsAt.slice(0, 16) : "",
            timeLimitSeconds: res.item.timeLimitSeconds || "",
            maxResponses: res.item.maxResponses || "",
            statusID: res.item.statusID || 1,
          });
          const existingCriteria = res.item.criteria || [];
          const mapped = { ...criteria };
          existingCriteria.forEach((item) => {
            if (mapped[item.criterionType]) {
              mapped[item.criterionType] = {
                ...mapped[item.criterionType],
                matchType: item.matchType,
                values: Array.isArray(item.valueJson)
                  ? item.valueJson
                  : mapped[item.criterionType].values,
                min: item.valueJson?.min ?? mapped[item.criterionType].min,
                max: item.valueJson?.max ?? mapped[item.criterionType].max,
              };
            }
          });
          setCriteria(mapped);
        }
        const genresRes = await fetchGenres(token);
        const gamesRes = await fetchGames(token);
        if (mounted) {
          setGenres(genresRes.items || []);
          setGames(gamesRes.items || []);
        }
      } catch (err) {
        alert(err.message || "Failed to load questionnaire");
      }
    }
    if (token) load();
    return () => {
      mounted = false;
    };
  }, [questionnaireId, token]);

  const orderedQuestions = useMemo(() => {
    if (!questionnaire?.questions) return [];
    return [...questionnaire.questions].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }, [questionnaire]);

  const normalizeNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  };

  const buildQuestionPayload = (form) => ({
    questionTypeID: Number(form.questionTypeID),
    questionText: form.questionText,
    helpText: form.helpText || null,
    isRequired: form.isRequired,
    displayOrder: form.displayOrder ? Number(form.displayOrder) : 1,
    minSelections: normalizeNumber(form.minSelections),
    maxSelections: normalizeNumber(form.maxSelections),
    minValue: normalizeNumber(form.minValue),
    maxValue: normalizeNumber(form.maxValue),
    stepValue: normalizeNumber(form.stepValue),
    placeholderText: form.placeholderText || null,
  });

  const getQuestionTypeLabel = (id) => {
    const found = questionTypes.find((type) => type.id === Number(id));
    return found ? found.label : `Type ${id}`;
  };

  const parseOptions = (value) =>
    value
      .split(/\r?\n|,/)
      .map((option) => option.trim())
      .filter(Boolean);

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionForm((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      if (name === "questionTypeID" && Number(nextValue) === 5) {
        return {
          ...prev,
          [name]: nextValue,
          minValue: prev.minValue || "1",
          maxValue: prev.maxValue || "5",
          stepValue: prev.stepValue || "1",
        };
      }
      return { ...prev, [name]: nextValue };
    });
  };

  const handleQuestionnaireChange = (e) => {
    const { name, value } = e.target;
    setQuestionnaireForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveQuestionnaire = async (e) => {
    e.preventDefault();
    if (!questionnaire) return;
    try {
      setSaving(true);
      const res = await updateQuestionnaire(questionnaireId, token, {
        title: questionnaireForm.title,
        description: questionnaireForm.description,
        statusID: questionnaireForm.statusID,
        startsAt: questionnaireForm.startsAt || null,
        endsAt: questionnaireForm.endsAt || null,
        timeLimitSeconds: questionnaireForm.timeLimitSeconds || null,
        maxResponses: questionnaireForm.maxResponses || null,
      });
      setQuestionnaire(res.item);
      alert("Questionnaire saved");
    } catch (err) {
      alert(err.message || "Failed to save questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionForm.questionText) return;
    try {
      setSaving(true);
      const res = await addQuestion(
        questionnaireId,
        token,
        buildQuestionPayload(questionForm),
      );

      const questionID = res.item.questionID;
      if (
        Number(questionForm.questionTypeID) === 3 ||
        Number(questionForm.questionTypeID) === 4
      ) {
        const options = parseOptions(questionForm.options);
        let order = 1;
        for (const optionText of options) {
          await addQuestionOption(questionID, token, {
            optionText,
            displayOrder: order,
          });
          order += 1;
        }
      }

      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
      setQuestionForm({
        questionTypeID: 1,
        questionText: "",
        helpText: "",
        isRequired: false,
        displayOrder: (refreshed.item.questions?.length || 0) + 1,
        options: "",
        newOptions: "",
        minSelections: "",
        maxSelections: "",
        minValue: "",
        maxValue: "",
        stepValue: "",
        placeholderText: "",
      });
    } catch (err) {
      alert(err.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionID(question.questionID);
    setQuestionForm({
      questionTypeID: question.questionTypeID,
      questionText: question.questionText,
      helpText: question.helpText || "",
      isRequired: question.isRequired,
      displayOrder: question.displayOrder,
      options: "",
      newOptions: "",
      minSelections:
        question.minSelections === null || question.minSelections === undefined
          ? ""
          : String(question.minSelections),
      maxSelections:
        question.maxSelections === null || question.maxSelections === undefined
          ? ""
          : String(question.maxSelections),
      minValue:
        question.minValue === null || question.minValue === undefined
          ? ""
          : String(question.minValue),
      maxValue:
        question.maxValue === null || question.maxValue === undefined
          ? ""
          : String(question.maxValue),
      stepValue:
        question.stepValue === null || question.stepValue === undefined
          ? ""
          : String(question.stepValue),
      placeholderText: question.placeholderText || "",
    });
    setOptionDrafts((prev) => {
      const next = { ...prev };
      (question.options || []).forEach((option) => {
        next[option.questionOptionID] = option.optionText;
      });
      return next;
    });
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestionID) return;
    try {
      setSaving(true);
      await updateQuestion(
        editingQuestionID,
        token,
        buildQuestionPayload(questionForm),
      );

      if (
        (Number(questionForm.questionTypeID) === 3 ||
          Number(questionForm.questionTypeID) === 4) &&
        questionForm.newOptions
      ) {
        const options = parseOptions(questionForm.newOptions);
        const existingOptionCount =
          questionnaire?.questions?.find(
            (item) => item.questionID === editingQuestionID,
          )?.options?.length || 0;
        let order = existingOptionCount + 1;
        for (const optionText of options) {
          await addQuestionOption(editingQuestionID, token, {
            optionText,
            displayOrder: order,
          });
          order += 1;
        }
      }

      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
      setEditingQuestionID(null);
      setQuestionForm({
        questionTypeID: 1,
        questionText: "",
        helpText: "",
        isRequired: false,
        displayOrder: (refreshed.item.questions?.length || 0) + 1,
        options: "",
        newOptions: "",
        minSelections: "",
        maxSelections: "",
        minValue: "",
        maxValue: "",
        stepValue: "",
        placeholderText: "",
      });
    } catch (err) {
      alert(err.message || "Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id, token);
      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
    } catch (err) {
      alert(err.message || "Failed to delete question");
    }
  };

  const handleReorderQuestion = async (questionID, direction) => {
    const index = orderedQuestions.findIndex(
      (item) => item.questionID === questionID,
    );
    if (index === -1) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= orderedQuestions.length) return;

    const current = orderedQuestions[index];
    const target = orderedQuestions[swapIndex];

    try {
      setSaving(true);
      await Promise.all([
        updateQuestion(current.questionID, token, {
          displayOrder: target.displayOrder,
        }),
        updateQuestion(target.questionID, token, {
          displayOrder: current.displayOrder,
        }),
      ]);
      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
    } catch (err) {
      alert(err.message || "Failed to reorder questions");
    } finally {
      setSaving(false);
    }
  };

  const handleCriteriaChange = (key, patch) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  const handleSaveCriteria = async () => {
    try {
      setSaving(true);
      const payload = [
        {
          criterionType: "gender",
          matchType: criteria.gender.matchType,
          value: criteria.gender.values,
        },
        {
          criterionType: "age",
          matchType: criteria.age.matchType,
          value: {
            min: criteria.age.min ? Number(criteria.age.min) : null,
            max: criteria.age.max ? Number(criteria.age.max) : null,
          },
        },
        {
          criterionType: "location",
          matchType: criteria.location.matchType,
          value: criteria.location.values,
        },
        {
          criterionType: "language",
          matchType: criteria.language.matchType,
          value: criteria.language.values,
        },
        {
          criterionType: "preferredGenre",
          matchType: criteria.preferredGenre.matchType,
          value: criteria.preferredGenre.values,
        },
        {
          criterionType: "recentGame",
          matchType: criteria.recentGame.matchType,
          value: criteria.recentGame.values,
        },
      ];
      await updateQuestionnaireCriteria(questionnaireId, token, payload);
      alert("Criteria saved");
    } catch (err) {
      alert(err.message || "Failed to save criteria");
    } finally {
      setSaving(false);
    }
  };

  const handleOptionDraftChange = (id, value) => {
    setOptionDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewOptionDraftChange = (questionID, value) => {
    setNewOptionDrafts((prev) => ({ ...prev, [questionID]: value }));
  };

  const handleAddOption = async (question) => {
    const draft = newOptionDrafts[question.questionID] || "";
    const options = parseOptions(draft);
    if (options.length === 0) return;
    try {
      let order = (question.options?.length || 0) + 1;
      for (const optionText of options) {
        await addQuestionOption(question.questionID, token, {
          optionText,
          displayOrder: order,
        });
        order += 1;
      }
      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
      setNewOptionDrafts((prev) => ({ ...prev, [question.questionID]: "" }));
    } catch (err) {
      alert(err.message || "Failed to add option");
    }
  };

  const handleSaveOption = async (optionID) => {
    try {
      await updateQuestionOption(optionID, token, {
        optionText: optionDrafts[optionID],
      });
      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
    } catch (err) {
      alert(err.message || "Failed to update option");
    }
  };

  const handleDeleteOption = async (optionID) => {
    if (!window.confirm("Delete this option?")) return;
    try {
      await deleteQuestionOption(optionID, token);
      const refreshed = await fetchQuestionnaire(questionnaireId, token);
      setQuestionnaire(refreshed.item);
    } catch (err) {
      alert(err.message || "Failed to delete option");
    }
  };

  const handleDeleteQuestionnaire = async () => {
    if (!window.confirm("Delete this questionnaire?")) return;
    try {
      await deleteQuestionnaire(questionnaireId, token);
      navigate(`/client/projects/${projectId}`);
    } catch (err) {
      alert(err.message || "Failed to delete questionnaire");
    }
  };

  if (!questionnaire) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  const isEditing = editingQuestionID !== null;

  return (
    <div className="min-h-screen text-white bg-[#1F1F1F]">
      <header className="flex items-center justify-end py-5 px-5 lg:px-10 gap-4">
        <TopBar />
      </header>
      <main className="w-full lg:max-w-[1440px] mx-auto p-5 mt-5 lg:mt-20">
        <div className="mb-10">
          <h3 className="text-[#F9B71E] text-3xl font-bold">
            {questionnaire.title}
          </h3>
          <p className="text-sm text-neutral-400">
            Manage questions and playtester criteria
          </p>
        </div>
        <div className="flex flex-col gap-5 lg:gap-15">
          <section className="bg-[#252525] rounded-xl p-5 lg:p-15 shadow-md ">
            <h4 className="font-semibold mb-3 text-2xl text-gray-200">
              Questionnaire Settings
            </h4>
            <hr className="border-gray-500 mb-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label
                  className="text-gray-300 mb-1 font-semibold"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  name="title"
                  value={questionnaireForm.title}
                  onChange={handleQuestionnaireChange}
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                  placeholder="Title"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-gray-300 mb-1 font-semibold"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={questionnaireForm.description}
                  onChange={handleQuestionnaireChange}
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                />
              </div>
              <div className="flex flex-col gap-1">
                {" "}
                <label
                  className="text-gray-300 mb-1 font-semibold"
                  htmlFor="startsAt"
                >
                  Starts At
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={questionnaireForm.startsAt}
                  onChange={handleQuestionnaireChange}
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                />
              </div>

              <div className="flex flex-col gap-1">
                {" "}
                <label
                  className="text-gray-300 mb-1 font-semibold"
                  htmlFor="endsAt"
                >
                  Ends At
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  value={questionnaireForm.endsAt}
                  onChange={handleQuestionnaireChange}
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="text-gray-300 mb-1 font-semibold"
                  htmlFor="timeLimitSeconds"
                >
                  Time Limit (seconds)
                </label>
                <input
                  name="timeLimitSeconds"
                  value={questionnaireForm.timeLimitSeconds}
                  onChange={handleQuestionnaireChange}
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-300 mb-1" htmlFor="maxResponses">
                  Max Responses
                </label>
                <input
                  name="maxResponses"
                  value={questionnaireForm.maxResponses}
                  onChange={handleQuestionnaireChange}
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-gray-300 mb-1 font-semibold"
                  htmlFor="statusID"
                >
                  Status
                </label>
                <Select
                  name="statusID"
                  value={questionnaireForm.statusID}
                  onChange={handleQuestionnaireChange}
                  options={[
                    { value: 1, label: "Draft" },
                    { value: 2, label: "Published" },
                    { value: 3, label: "Archived" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center gap-5 mt-10 justify-end">
              <button
                onClick={handleSaveQuestionnaire}
                disabled={saving}
                className="bg-linear-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-3 rounded font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Questionnaire"}
              </button>
              <button
                onClick={handleDeleteQuestionnaire}
                className="text-red-400 text-sm"
              >
                <Trash2 />
              </button>
            </div>
          </section>

          <section className="bg-[#252525] rounded-xl p-5 lg:p-15 shadow-md">
            <h4 className="font-semibold mb-3 text-2xl text-gray-200">
              Playtester Criteria
            </h4>
            <hr className="border-gray-500 mb-10" />
            <div className="space-y-4 grid lg:grid-cols-2 grid-cols-1">
              <div>
                <label className="text-gray-300 mb-1 font-semibold">
                  Gender
                </label>

                <div className="flex items-center gap-2 mt-2">
                  <Select
                    name="genderMatchType"
                    value={criteria.gender.matchType}
                    onChange={(e) =>
                      handleCriteriaChange("gender", {
                        matchType: e.target.value,
                      })
                    }
                    options={[
                      { value: "Priority", label: "Priority" },
                      { value: "Requirement", label: "Requirement" },
                    ]}
                    className="max-w-[150px]"
                  />

                  <MultiSelect
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Non-binary", label: "Non-binary" },
                      {
                        value: "Prefer not to say",
                        label: "Prefer not to say",
                      },
                    ]}
                    value={criteria.gender.values}
                    onChange={(vals) =>
                      handleCriteriaChange("gender", { values: vals })
                    }
                    placeholder="Select gender"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 mb-1 font-semibold">
                  Age Range
                </label>
                <div className="flex gap-2 mt-2">
                  <Select
                    name="ageMatchType"
                    value={criteria.age.matchType}
                    onChange={(e) =>
                      handleCriteriaChange("age", { matchType: e.target.value })
                    }
                    options={[
                      { value: "Priority", label: "Priority" },
                      { value: "Requirement", label: "Requirement" },
                    ]}
                    className="max-w-[150px]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={criteria.age.min}
                      onChange={(e) =>
                        handleCriteriaChange("age", { min: e.target.value })
                      }
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5 max-h-[46px]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={criteria.age.max}
                      onChange={(e) =>
                        handleCriteriaChange("age", { max: e.target.value })
                      }
                      className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5 max-h-[46px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-300 mb-1 font-semibold">
                  Location
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Select
                    name="locationMatchType"
                    value={criteria.location.matchType}
                    onChange={(e) =>
                      handleCriteriaChange("location", {
                        matchType: e.target.value,
                      })
                    }
                    options={[
                      { value: "Priority", label: "Priority" },
                      { value: "Requirement", label: "Requirement" },
                    ]}
                    className="max-w-[150px]"
                  />

                  <MultiSelect
                    options={countries.map((c) => ({
                      value: c.code,
                      label: c.name,
                    }))}
                    value={criteria.location.values}
                    onChange={(vals) =>
                      handleCriteriaChange("location", { values: vals })
                    }
                    placeholder="Select countries"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 mb-1 font-semibold">
                  Language
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Select
                    name="languageMatchType"
                    value={criteria.language.matchType}
                    onChange={(e) =>
                      handleCriteriaChange("language", {
                        matchType: e.target.value,
                      })
                    }
                    options={[
                      { value: "Priority", label: "Priority" },
                      { value: "Requirement", label: "Requirement" },
                    ]}
                    className="max-w-[150px]"
                  />

                  <MultiSelect
                    options={[
                      "English",
                      "Spanish",
                      "French",
                      "German",
                      "Italian",
                      "Portuguese",
                      "Dutch",
                      "Swedish",
                      "Norwegian",
                      "Danish",
                      "Finnish",
                      "Polish",
                      "Czech",
                      "Hungarian",
                      "Romanian",
                      "Greek",
                      "Turkish",
                      "Russian",
                      "Ukrainian",
                      "Arabic",
                      "Hebrew",
                      "Hindi",
                      "Urdu",
                      "Bengali",
                      "Tamil",
                      "Telugu",
                      "Thai",
                      "Vietnamese",
                      "Indonesian",
                      "Malay",
                      "Filipino",
                      "Korean",
                      "Japanese",
                      "Chinese (Simplified)",
                      "Chinese (Traditional)",
                    ].map((lang) => ({
                      value: lang,
                      label: lang,
                    }))}
                    value={criteria.language.values}
                    onChange={(vals) =>
                      handleCriteriaChange("language", { values: vals })
                    }
                    placeholder="Select languages"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 mb-1 font-semibold">
                  Preferred Genre
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Select
                    name="preferredGenreMatchType"
                    value={criteria.preferredGenre.matchType}
                    onChange={(e) =>
                      handleCriteriaChange("preferredGenre", {
                        matchType: e.target.value,
                      })
                    }
                    options={[
                      { value: "Priority", label: "Priority" },
                      { value: "Requirement", label: "Requirement" },
                    ]}
                    className="max-w-[150px]"
                  />

                  <MultiSelect
                    options={genres.map((genre) => ({
                      value: String(genre.gameGenreID),
                      label: genre.name,
                    }))}
                    value={criteria.preferredGenre.values.map(String)}
                    onChange={(vals) =>
                      handleCriteriaChange("preferredGenre", {
                        values: vals.map(Number),
                      })
                    }
                    placeholder="Select genres"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 mb-1 font-semibold">
                  Recent Game
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Select
                    name="recentGameMatchType"
                    value={criteria.recentGame.matchType}
                    onChange={(e) =>
                      handleCriteriaChange("recentGame", {
                        matchType: e.target.value,
                      })
                    }
                    options={[
                      { value: "Priority", label: "Priority" },
                      { value: "Requirement", label: "Requirement" },
                    ]}
                    className="max-w-[150px]"
                  />

                  <MultiSelect
                    options={games.map((game) => ({
                      value: String(game.gameID),
                      label: game.name,
                    }))}
                    value={criteria.recentGame.values.map(String)}
                    onChange={(vals) =>
                      handleCriteriaChange("recentGame", {
                        values: vals.map(Number),
                      })
                    }
                    placeholder="Select recent games"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveCriteria}
                disabled={saving}
                className="mt-6 bg-linear-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-3 rounded font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Criteria"}
              </button>
            </div>
          </section>

          <section className="bg-[#252525] rounded-xl  p-5 lg:p-15 shadow-md">
            <h4 className="font-semibold mb-3 text-2xl text-gray-200">
              Questions
            </h4>
            <hr className="border-gray-500 mb-10" />

            <div className="mt-6">
              <h5 className="font-semibold mb-3">
                {isEditing ? "Edit Question" : "Add Question"}
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-gray-300 mb-1 font-semibold"
                    htmlFor="questionTypeID"
                  >
                    Question type
                  </label>
                  <Select
                    name="questionTypeID"
                    value={questionForm.questionTypeID}
                    onChange={handleQuestionChange}
                    options={questionTypes.map((t) => ({
                      value: t.id,
                      label: t.label,
                    }))}
                    className="mb-5"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {" "}
                  <label
                    className="text-gray-300 mb-1 font-semibold"
                    htmlFor="questionText"
                  >
                    Question Text
                  </label>
                  <input
                    name="questionText"
                    value={questionForm.questionText}
                    onChange={handleQuestionChange}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  {" "}
                  <label
                    className="text-gray-300 mb-1 font-semibold"
                    htmlFor="helpText"
                  >
                    Help text (optional)
                  </label>
                  <textarea
                    name="helpText"
                    value={questionForm.helpText}
                    onChange={handleQuestionChange}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {" "}
                  <label
                    className="text-gray-300 mb-1 font-semibold"
                    htmlFor="placeholderText"
                  >
                    Placeholder text (optional)
                  </label>
                  <input
                    name="placeholderText"
                    value={questionForm.placeholderText}
                    onChange={handleQuestionChange}
                    className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {" "}
                  <label className="flex items-center gap-2 text-gray-300 mb-5 font-semibold">
                    <input
                      type="checkbox"
                      name="isRequired"
                      checked={questionForm.isRequired}
                      onChange={handleQuestionChange}
                    />
                    Required
                  </label>
                </div>

                {(Number(questionForm.questionTypeID) === 3 ||
                  Number(questionForm.questionTypeID) === 4) && (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col justify-center">
                        <label
                          className="text-gray-300 mb-1 font-semibold"
                          htmlFor="minSelections"
                        >
                          Min selections
                        </label>
                        <input
                          name="minSelections"
                          value={questionForm.minSelections}
                          onChange={handleQuestionChange}
                          className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        {" "}
                        <label
                          className="text-gray-300 mb-1 font-semibold"
                          htmlFor="maxSelections"
                        >
                          Max selections
                        </label>
                        <input
                          name="maxSelections"
                          value={questionForm.maxSelections}
                          onChange={handleQuestionChange}
                          className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5"
                        />
                      </div>
                    </div>
                    {!isEditing ? (
                      <div className="w-full">
                        <label
                          className="text-gray-300 mb-1 font-semibold"
                          htmlFor="options"
                        >
                          Options (one per line)
                        </label>
                        <textarea
                          name="options"
                          value={questionForm.options}
                          onChange={handleQuestionChange}
                          className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5 w-full"
                        />
                      </div>
                    ) : (
                      <div>
                        <label
                          className="text-gray-300 mb-1 font-semibold"
                          htmlFor="newOptions"
                        >
                          Add new options (one per line)
                        </label>
                        <textarea
                          name="newOptions"
                          value={questionForm.newOptions}
                          onChange={handleQuestionChange}
                          className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5 w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
                {(Number(questionForm.questionTypeID) === 5 ||
                  Number(questionForm.questionTypeID) === 6) && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col justify-center">
                      <label
                        className="text-gray-300 mb-1 font-semibold"
                        htmlFor="minValue"
                      >
                        Min value
                      </label>
                      <input
                        name="minValue"
                        value={questionForm.minValue}
                        onChange={handleQuestionChange}
                        className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5  w-full"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      {" "}
                      <label
                        className="text-gray-300 mb-1 font-semibold"
                        htmlFor="minValue"
                      >
                        Max value
                      </label>
                      <input
                        name="maxValue"
                        value={questionForm.maxValue}
                        onChange={handleQuestionChange}
                        className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5 w-full"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      {" "}
                      <label
                        className="text-gray-300 mb-1 font-semibold"
                        htmlFor="minValue"
                      >
                        Step
                      </label>
                      <input
                        name="stepValue"
                        value={questionForm.stepValue}
                        onChange={handleQuestionChange}
                        className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg mb-5  w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleUpdateQuestion}
                    disabled={saving}
                    className="bg-linear-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-3 rounded font-semibold disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Update Question"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestionID(null);
                      setQuestionForm({
                        questionTypeID: 1,
                        questionText: "",
                        helpText: "",
                        isRequired: false,
                        displayOrder:
                          (questionnaire?.questions?.length || 0) + 1,
                        options: "",
                        newOptions: "",
                        minSelections: "",
                        maxSelections: "",
                        minValue: "",
                        maxValue: "",
                        stepValue: "",
                        placeholderText: "",
                      });
                    }}
                    className="text-sm text-neutral-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={handleAddQuestion}
                    disabled={saving}
                    className="bg-linear-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-3 rounded font-semibold disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Add Question"}
                  </button>
                </div>
              )}
            </div>
            <div className="lg:bg-[#2c2c2c] mt-10 rounded-xl lg:p-10">
              {orderedQuestions.length ? (
                <div className="space-y-4">
                  {orderedQuestions.map((q, index) => (
                    <div
                      key={q.questionID}
                      className={`border  rounded-lg p-4 ${
                        editingQuestionID === q.questionID
                          ? "border-yellow-400"
                          : "border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{q.questionText}</p>
                            <span className="text-xs text-neutral-400">
                              {getQuestionTypeLabel(q.questionTypeID)}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">
                            Order {q.displayOrder} ·{" "}
                            {q.isRequired ? "Required" : "Optional"}
                          </p>
                          {q.helpText && (
                            <p className="text-xs text-neutral-300 mt-1">
                              {q.helpText}
                            </p>
                          )}
                          {q.placeholderText && (
                            <p className="text-xs text-neutral-500">
                              Placeholder: {q.placeholderText}
                            </p>
                          )}
                          {(q.minSelections ||
                            q.maxSelections ||
                            q.minValue ||
                            q.maxValue ||
                            q.stepValue) && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Constraints:{" "}
                              {[
                                q.minSelections &&
                                  `min select ${q.minSelections}`,
                                q.maxSelections &&
                                  `max select ${q.maxSelections}`,
                                q.minValue && `min ${q.minValue}`,
                                q.maxValue && `max ${q.maxValue}`,
                                q.stepValue && `step ${q.stepValue}`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          {q.options?.length > 0 && (
                            <div className="mt-2 space-y-2 grid grid-cols-1 lg:grid-cols-2 space-x-10">
                              {q.options.map((option) => (
                                <div
                                  key={option.questionOptionID}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <input
                                    value={
                                      optionDrafts[option.questionOptionID] ??
                                      option.optionText
                                    }
                                    onChange={(e) =>
                                      handleOptionDraftChange(
                                        option.questionOptionID,
                                        e.target.value,
                                      )
                                    }
                                    className=" text-black rounded text-xs w-full lg:max-w-sm bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none w-full"
                                  />
                                  <button
                                    onClick={() =>
                                      handleSaveOption(option.questionOptionID)
                                    }
                                    className="text-xs text-green-400"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteOption(
                                        option.questionOptionID,
                                      )
                                    }
                                    className="text-xs text-red-400"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {(Number(q.questionTypeID) === 3 ||
                            Number(q.questionTypeID) === 4) && (
                            <div className="mt-2 flex items-center gap-2">
                              <textarea
                                value={newOptionDrafts[q.questionID] || ""}
                                onChange={(e) =>
                                  handleNewOptionDraftChange(
                                    q.questionID,
                                    e.target.value,
                                  )
                                }
                                className="text-black rounded text-xs w-full lg:max-w-sm bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:placeholder-gray-400 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none"
                                placeholder="Add option (one per line)"
                              />
                              <button
                                onClick={() => handleAddOption(q)}
                                className="text-xs text-yellow-400 mt-1"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-row items-start gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleReorderQuestion(q.questionID, "up")
                              }
                              disabled={index === 0 || saving}
                              className="text-xs text-neutral-400 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() =>
                                handleReorderQuestion(q.questionID, "down")
                              }
                              disabled={
                                index === orderedQuestions.length - 1 || saving
                              }
                              className="text-xs text-neutral-400 disabled:opacity-50"
                            >
                              ↓
                            </button>
                          </div>
                          <button
                            onClick={() => handleEditQuestion(q)}
                            className="text-xs text-yellow-400"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.questionID)}
                            className="text-xs text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">No questions yet.</p>
              )}
            </div>
          </section>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate(`/client/projects/${projectId}`)}
            className="text-sm text-neutral-400 flex items-center hover:text-yellow-400 transition-color"
          >
            <ChevronLeft />
            Back to project
          </button>
        </div>
      </main>
    </div>
  );
}

export default ClientQuestionnaireBuilder;
