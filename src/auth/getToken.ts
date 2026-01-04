import { writeFile } from "fs";
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

  envString += `\nSPOTIFY_TOKEN=${token}\n`;
  writeFile(".env", token, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
  return token;
}
