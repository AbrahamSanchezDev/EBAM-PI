import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const unreadOnly = url.searchParams.get("unreadOnly");

  if (!email) {
    return NextResponse.json({ error: "email query required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const filter: any = { to: email };
  if (unreadOnly === "1") filter.read = false;

  const items = await db
    .collection("notifications")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const unreadCount = await db.collection("notifications").countDocuments({ to: email, read: false });

  return NextResponse.json({ count: unreadCount, items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, from } = body as { to: string; message: string; from?: string };
    if (!to || !message) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newNotification = {
      to,
      from: from || "system",
      message,
      createdAt: new Date(),
      read: false,
    };

    const result = await db.collection("notifications").insertOne(newNotification as any);
    const inserted = await db.collection("notifications").findOne({ _id: result.insertedId });

    // ensure indexes exist (idempotent)
    await db.collection("notifications").createIndex({ to: 1, read: 1 });
    await db.collection("notifications").createIndex({ createdAt: -1 });

    return NextResponse.json({ ...inserted, id: (inserted?._id as ObjectId).toHexString() }, { status: 201 });
  } catch (err) {
    console.error("POST /api/notifications error", err);
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { db } = await connectToDatabase();

    if (body.id) {
      const oid = new ObjectId(body.id);
      await db.collection("notifications").updateOne({ _id: oid }, { $set: { read: true } });
      return NextResponse.json({ ok: true });
    }

    if (body.markAllFor) {
      const email = body.markAllFor as string;
      await db.collection("notifications").updateMany({ to: email }, { $set: { read: true } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "id or markAllFor required" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/notifications error", err);
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}
