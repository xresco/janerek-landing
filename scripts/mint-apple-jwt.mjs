// Mints the Apple Sign-In client_secret JWT that Supabase needs when the
// Apple provider is in manual-JWT mode. Run it locally — never commit
// the .p8 file or the resulting JWT.
//
// Usage:
//   1. npm install jose
//   2. Fill in the four values below
//   3. node scripts/mint-apple-jwt.mjs
//   4. Copy the printed JWT into Supabase Auth → Providers → Apple →
//      "Secret Key (for OAuth)". Re-run before the JWT expires (max 6
//      months).

import { SignJWT, importPKCS8 } from "jose";
import { readFileSync } from "fs";

// === FILL THESE IN ===
const TEAM_ID = "87UL927H55";              // Apple Dev Team ID (from portal top-right)
const KEY_ID = "4R7NQL9TMC";                // 10-char ID from your AuthKey_*.p8 filename
const SERVICES_ID = "com.janerek.web";      // The Services ID you registered
const P8_PATH = "/Users/abedalmoradi/projects/dating/apple_p8_keys/Janerek_Apple_APN_AuthKey_4R7NQL9TMC.p8";
// =====================

const privateKeyPem = readFileSync(P8_PATH, "utf8");
const privateKey = await importPKCS8(privateKeyPem, "ES256");

const now = Math.floor(Date.now() / 1000);
// Apple caps client_secret lifetime at 6 months. Use ~5 to leave buffer.
const fiveMonths = 60 * 60 * 24 * 30 * 5;

const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: KEY_ID })
    .setIssuer(TEAM_ID)
    .setIssuedAt(now)
    .setExpirationTime(now + fiveMonths)
    .setAudience("https://appleid.apple.com")
    .setSubject(SERVICES_ID)
    .sign(privateKey);

console.log(jwt);
console.log(
    `\nExpires: ${new Date((now + fiveMonths) * 1000).toISOString()}\n` +
    "Set a calendar reminder to regenerate before then."
);
