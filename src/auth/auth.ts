import crypto from "crypto";
import type { SpotifyTokenResponse } from "../types/types";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://127.0.0.1:8888/callback";

// PKCE
function generateCodeChallenge(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return { codeVerifier, codeChallenge };
}

function getAuthUrl(): { url: string; codeVerifier: string } {
  const { codeVerifier, codeChallenge } = generateCodeChallenge();

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "user-library-read",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  return {
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    codeVerifier,
  };
}

async function exchangeCode(
  code: string,
  codeVerifier: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID!,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data: SpotifyTokenResponse =
    (await response.json()) as SpotifyTokenResponse;
  return data;
}

// Refresh access token using refresh token
export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  return data;
}

export async function startAuthFlow(): Promise<SpotifyTokenResponse> {
  return new Promise((resolve, reject) => {
    const { url: authUrl, codeVerifier } = getAuthUrl();

    const server = Bun.serve({
      port: 8888,
      hostname: "127.0.0.1",
      async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");

          if (error) {
            server.stop();
            reject(new Error(`Authorization failed: ${error}`));
            return new Response("Authorization failed", { status: 400 });
          }

          if (code) {
            try {
              const token = await exchangeCode(code, codeVerifier);
              console.log("\nAccess Token received!");

              server.stop();
              resolve(token);

              return new Response(
                "Authorization successful! You can close this window.",
                {
                  headers: { "Content-Type": "text/html" },
                }
              );
            } catch (err) {
              server.stop();
              reject(err);
              return new Response("Token exchange failed", { status: 500 });
            }
          }
        }

        return new Response("Invalid request", { status: 400 });
      },
    });

    console.log("Opening browser for authorization...\n");
    console.log("If browser doesn't open, go to:", authUrl, "\n");

    Bun.spawn(["open", authUrl]);

    setTimeout(() => {
      server.stop();
      reject(new Error("Authorization timeout - no response received"));
    }, 5 * 60 * 500);
  });
}
