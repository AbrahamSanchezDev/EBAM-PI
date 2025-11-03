import { NextRequest, NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";
import { ObjectId } from "mongodb";
import { publish } from "@/app/lib/broadcaster";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const unreadOnly = url.searchParams.get("unreadOnly");

  if (!email) {
    return NextResponse.json({ error: "email query required" }, { status: 400 });
  }
  const { db } = await connectFromRequest(req);

  // Read notifications embedded in the profile document
  const profile = await db.collection("profiles").findOne({ email });
  if (!profile) {
    return NextResponse.json({ count: 0, items: [] });
  }

  const rawItems = Array.isArray(profile.notifications) ? profile.notifications.slice() : [];
  // sort by createdAt desc
  rawItems.sort((a: any, b: any) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  const items = rawItems.slice(0, 100);

  const unreadCount = rawItems.filter((it: any) => it.read !== true).length;

  const normalized = items.map((it: any) => ({
    id: it.id || undefined,
    to: email,
    from: it.from,
    message: it.message,
    createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : new Date().toISOString(),
    read: !!it.read,
  }));

  return NextResponse.json({ count: unreadCount, items: normalized });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, from } = body as { to: string; message: string; from?: string };
    if (!to || !message) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 });
    }
    const { db } = await connectFromRequest(req);

    const notif = {
      id: new ObjectId().toString(),
      from: from || "system",
      message,
      createdAt: new Date().toISOString(),
      read: false,
    } as any;

    const r = await db.collection("profiles").findOneAndUpdate(
      { email: to },
      { $push: { notifications: { $each: [notif], $position: 0 } } },
      { returnDocument: "after" }
    );

    if (!r.value) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    try {
      publish("notification-created", { ...notif, to });
    } catch (e) {
      // non-fatal if broadcaster isn't available
    }

    return NextResponse.json({ ...notif, to }, { status: 201 });
  } catch (err) {
    console.error("POST /api/notifications error", err);
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { db } = await connectFromRequest(req);

    if (body.id) {
      const nid = body.id as string;
      const r = await db.collection("profiles").updateOne(
        { "notifications.id": nid },
        { $set: { "notifications.$.read": true } }
      );
      if (r.matchedCount === 0) return NextResponse.json({ error: "notification not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (body.markAllFor) {
      const email = body.markAllFor as string;
      const r = await db.collection("profiles").updateOne(
        { email },
        { $set: { "notifications.$[].read": true } }
      );
      if (r.matchedCount === 0) return NextResponse.json({ error: "profile not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "id or markAllFor required" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/notifications error", err);
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}
