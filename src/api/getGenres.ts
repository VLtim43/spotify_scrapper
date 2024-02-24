import dotenv from "dotenv";
dotenv.config();
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

if (process.env.TOKEN) {
  spotifyApi.setAccessToken(process.env.TOKEN);
} else {
  console.error("Access token is undefined");
}

// For some reason, you can't get a given album's genres.
// See: https://community.spotify.com/t5/Spotify-for-Developers/Getting-album-not-getting-genre/td-p/5093156
// As a workaround, we get the artist's genres. It's not ideal, sometimes it's empty and may 429 the api, but it's a limitation we work with.
export const getArtistGenres = async (artist_id: string): Promise<string[]> => {
  try {
    const {
      body: { genres },
    } = await spotifyApi.getArtist(artist_id);
    return genres;
  } catch (error) {
    console.error("Error retrieving artist genres:");

    return [];
  }
};
