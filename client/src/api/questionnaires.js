import { request, authHeaders } from "./http";

export async function createQuestionnaire(token, payload) {
  return request("/questionnaires", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateQuestionnaire(id, token, payload) {
  return request(`/questionnaires/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteQuestionnaire(id, token) {
  return request(`/questionnaires/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function fetchQuestionnaire(id, token) {
  return request(`/questionnaires/${id}`, { headers: authHeaders(token) });
}

export async function updateQuestionnaireCriteria(id, token, criteria) {
  return request(`/questionnaires/${id}/criteria`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ criteria }),
  });
}

export async function addQuestion(id, token, payload) {
  return request(`/questionnaires/${id}/questions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateQuestion(questionID, token, payload) {
  return request(`/questions/${questionID}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteQuestion(questionID, token) {
  return request(`/questions/${questionID}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function addQuestionOption(questionID, token, payload) {
  return request(`/questions/${questionID}/options`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateQuestionOption(optionID, token, payload) {
  return request(`/question-options/${optionID}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteQuestionOption(optionID, token) {
  return request(`/question-options/${optionID}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
