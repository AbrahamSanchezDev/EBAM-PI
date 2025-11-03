import { NextRequest, NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").toString();
    if (!email) return NextResponse.json({ found: false, candidates: [] });
    const trimmed = email.trim();
    const { db } = await connectFromRequest(req);

    // Try exact
    let p = await db.collection("profiles").findOne({ email: trimmed });
    if (p) return NextResponse.json({ found: true, email: p.email });

    // Try case-insensitive exact
    try {
      const esc = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      p = await db.collection("profiles").findOne({ email: { $regex: `^${esc}$`, $options: "i" } });
      if (p) return NextResponse.json({ found: true, email: p.email });
    } catch (e) {
      // ignore regex errors
    }

    // Return some candidate emails that contain the fragment (for debugging)
    const candidates = await db
      .collection("profiles")
      .find({ email: { $regex: trimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), $options: "i" } })
      .limit(5)
      .project({ email: 1 })
      .toArray();

    return NextResponse.json({ found: false, candidates: candidates.map((c: any) => c.email) });
  } catch (err) {
    console.error("GET /api/profiles/lookup error", err);
    return NextResponse.json({ found: false, candidates: [] }, { status: 500 });
  }
}
