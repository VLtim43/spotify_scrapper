import { startAuthServer } from "./auth";

// save on .env
export async function getToken(): Promise<string> {
  if (process.env.SPOTIFY_TOKEN) {
    console.log("loaded token from .env");
    return process.env.SPOTIFY_TOKEN;
  }

  console.log("no token found, running auth flow...");
  const token = await startAuthServer();

  let envString = "";
  try {
    envString = await Bun.file(".env").text();
  } catch {
    console.log("error file");
  }

  const lines = envString
    .split("\n")
    .filter((line) => !line.startsWith("SPOTIFY_TOKEN=") && line.trim() !== "");

  lines.push(`SPOTIFY_TOKEN=${token}`);

  envString = lines.join("\n");

  await Bun.write(".env", envString);
  console.log("The file has been saved!");
  return token;
}
