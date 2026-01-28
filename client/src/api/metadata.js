import { request, authHeaders } from "./http";

export async function fetchGenres(token) {
  return request("/metadata/genres", { headers: authHeaders(token) });
}

export async function fetchGames(token) {
  return request("/metadata/games", { headers: authHeaders(token) });
}
