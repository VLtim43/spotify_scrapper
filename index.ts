import { getToken } from "./src/auth/getToken";
const token = await getToken();

async function fetchWebApi(endpoint: string, method: string) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
  });
  return await res.json();
}

type track = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
};

async function getSavedTracks() {
  const response = await fetchWebApi("v1/me/tracks?limit=1", "GET");
  return response;
}

const savedTracks = await getSavedTracks();
console.log(savedTracks);
