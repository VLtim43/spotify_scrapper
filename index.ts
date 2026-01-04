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
