const token = process.env.SPOTIFY_TOKEN;

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

async function getTopTracks() {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  const response = (await fetchWebApi(
    "v1/me/top/tracks?time_range=long_term&limit=5",
    "GET"
  )) as track[];

  return response;
}

const topTracks = await getTopTracks();
console.log(topTracks);
