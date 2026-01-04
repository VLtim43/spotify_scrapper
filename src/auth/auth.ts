import crypto from "crypto";

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

function getAuthUrl() {
  const { codeVerifier, codeChallenge } = generateCodeChallenge();

  process.env.CODE_VERIFIER = codeVerifier;

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "user-top-read",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(code: string) {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID!,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: process.env.CODE_VERIFIER!,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// auth server
export async function startAuthServer(): Promise<string> {
  return new Promise((resolve, reject) => {
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
              const token = await getAccessToken(code);
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

    const authUrl = getAuthUrl();
    console.log("Opening browser for authorization...\n");
    console.log("If browser doesn't open, go to:", authUrl, "\n");

    Bun.spawn(["open", authUrl]);

    setTimeout(() => {
      server.stop();
      reject(new Error("Authorization timeout - no response received"));
    }, 5 * 60 * 500);
  });
}
