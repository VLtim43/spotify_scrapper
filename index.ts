import { getToken, clearToken, refreshToken } from "./src/auth/handleToken";

async function fetchWebApi(endpoint: string, method: string) {
  const token = await getToken();

  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
  });

  if (res.status === 401) {
    console.log("expired token... refreshing");

    const newToken = await refreshToken();

    const retryRes = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
      method,
    });

    return await retryRes.json();
  }

  return await res.json();
}

async function getSavedTracks() {
  const response = await fetchWebApi("v1/me/tracks?limit=1", "GET");
  return response;
}

const savedTracks = await getSavedTracks();
console.log(savedTracks);
