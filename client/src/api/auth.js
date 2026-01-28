import { request, authHeaders } from "./http";

export async function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register({ email, password, roleID }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, roleID }),
  });
}

export async function me(token) {
  return request("/auth/me", {
    headers: authHeaders(token),
  });
}

export async function updateOnboarding(token, payload) {
  return request("/users/me/onboarding", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateCommunitySetting(token, communitySettingID) {
  return request("/users/me/community-setting", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ communitySettingID }),
  });
}
