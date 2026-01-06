import { startAuthFlow, refreshAccessToken } from "./auth";

async function ensureEnvFile(): Promise<void> {
  const file = Bun.file(".env");
  const exists = await file.exists();

  if (!exists) {
    await Bun.write(".env", "");
    console.log("created .env file");
  }
}

export async function saveToken(
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  await ensureEnvFile();
  const envString = await Bun.file(".env").text();

  const lines = envString
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("SPOTIFY_TOKEN=") &&
        !line.startsWith("SPOTIFY_REFRESH_TOKEN=") &&
        line.trim() !== ""
    );

  lines.push(`SPOTIFY_TOKEN=${accessToken}`);

  if (refreshToken) {
    lines.push(`SPOTIFY_REFRESH_TOKEN=${refreshToken}`);
    process.env.SPOTIFY_REFRESH_TOKEN = refreshToken;
  }

  await Bun.write(".env", lines.join("\n"));

  process.env.SPOTIFY_TOKEN = accessToken;

  console.log("Token saved to .env");
}

export async function clearToken(): Promise<void> {
  await ensureEnvFile();
  const envString = await Bun.file(".env").text();

  const lines = envString
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("SPOTIFY_TOKEN=") &&
        !line.startsWith("SPOTIFY_REFRESH_TOKEN=")
    );

  await Bun.write(".env", lines.join("\n"));

  delete process.env.SPOTIFY_TOKEN;
  delete process.env.SPOTIFY_REFRESH_TOKEN;
  console.log("Token cleared");
}

function loadToken(): { accessToken?: string; refreshToken?: string } {
  return {
    accessToken: process.env.SPOTIFY_TOKEN,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
  };
}

export async function getToken(): Promise<string> {
  const { accessToken } = loadToken();

  if (accessToken) {
    console.log("loaded token from .env");
    return accessToken;
  }

  console.log("no token found, starting auth flow...");

  const tokenResponse = await startAuthFlow();
  await saveToken(tokenResponse.access_token, tokenResponse.refresh_token);

  return tokenResponse.access_token;
}

export async function refreshToken(): Promise<string> {
  const { refreshToken: storedRefreshToken } = loadToken();

  if (!storedRefreshToken) {
    console.log("No refresh token found, starting new auth flow...");
    return await getToken();
  }

  try {
    const tokenResponse = await refreshAccessToken(storedRefreshToken);

    // Save the new access token (and new refresh token if provided)
    await saveToken(
      tokenResponse.access_token,
      tokenResponse.refresh_token || storedRefreshToken
    );

    console.log("Token refreshed");
    return tokenResponse.access_token;
  } catch (error) {
    console.log("Refresh token invalid, starting new auth flow...");
    await clearToken();
    return await getToken();
  }
}

export async function ensureValidToken(): Promise<string> {
  const { accessToken, refreshToken: storedRefreshToken } = loadToken();

  if (!accessToken) {
    return await getToken();
  }

  if (!storedRefreshToken) {
    return accessToken;
  }

  return accessToken;
}
