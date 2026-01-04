import crypto from "crypto";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://localhost:8888/callback";

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
