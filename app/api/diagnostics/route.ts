import { NextResponse } from "next/server";

function extractHost(uri: string | undefined) {
  if (!uri) return "unknown";
  try {
    const afterProto = uri.replace(/^.*?:\/\//, "");
    const noCreds = afterProto.includes("@") ? afterProto.split("@").pop() : afterProto;
    return noCreds.split("/")[0] || "unknown";
  } catch (e) {
    return "unknown";
  }
}

export async function GET() {
  const isProduction = process.env.VERCEL === "1" || !!process.env.VERCEL_URL || process.env.NODE_ENV === "production";
  const DEFAULT_USE_ATLAS = String(process.env.MONGODB_DEFAULT_USE_ATLAS || "false").toLowerCase() === "true";

  const MONGODB_URI = process.env.MONGODB_URI || "";
  const MONGODB_URI_ATLAS = process.env.MONGODB_URI_ATLAS || "";
  const MONGODB_URI_LOCAL = process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/rfid";

  // Determine chosen source using same rules as mongodb.js (but don't expose secrets)
  let chosenSource = null;
  let chosenUri = "";
  if (isProduction && MONGODB_URI_ATLAS) {
    chosenSource = "MONGODB_URI_ATLAS";
    chosenUri = MONGODB_URI_ATLAS;
  } else if (MONGODB_URI) {
    chosenSource = "MONGODB_URI";
    chosenUri = MONGODB_URI;
  } else if (MONGODB_URI_ATLAS && DEFAULT_USE_ATLAS) {
    chosenSource = "MONGODB_URI_ATLAS";
    chosenUri = MONGODB_URI_ATLAS;
  } else {
    chosenSource = "MONGODB_URI_LOCAL";
    chosenUri = MONGODB_URI_LOCAL;
  }

  const hostLabel = extractHost(chosenUri);

  const body = {
    ok: true,
    isProduction,
    chosenSource,
    host: hostLabel,
    env: {
      MONGODB_URI_set: Boolean(MONGODB_URI),
      MONGODB_URI_ATLAS_set: Boolean(MONGODB_URI_ATLAS),
      MONGODB_URI_LOCAL_set: Boolean(MONGODB_URI_LOCAL),
      MONGODB_DEFAULT_USE_ATLAS: DEFAULT_USE_ATLAS,
    },
  };

  return NextResponse.json(body, { status: 200 });
}
