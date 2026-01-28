import { request, authHeaders } from "./http";

export async function updateProfile(token, payload) {
  return request("/users/me/profile", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}
