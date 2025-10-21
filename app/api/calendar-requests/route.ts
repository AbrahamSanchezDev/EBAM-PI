import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calendarName, title, start, end, description, requesterEmail } = body;
    if (!calendarName || !title || !start || !end || !requesterEmail) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Basic server-side check: require x-user-email header to match requesterEmail
    const headerEmail = req.headers.get("x-user-email");
    if (!headerEmail || headerEmail !== requesterEmail) {
      return NextResponse.json({ error: "invalid user" }, { status: 403 });
    }
    const { db } = await connectToDatabase();
    const doc = {
      calendarName,
      title,
      start: new Date(start),
      end: new Date(end),
      description: description || "",
      requesterEmail,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await db.collection("calendarRequests").insertOne(doc as any);
    const inserted = await db
      .collection("calendarRequests")
      .findOne({ _id: res.insertedId });
    // Notify admins
    const admins = await db.collection("profiles").find({ role: "admin" }).toArray();
    const notifications = admins.map((a: any) => ({
      to: a.email,
      from: requesterEmail,
      message: `Nueva solicitud de evento para el calendario \"${calendarName}\"`,
      createdAt: new Date(),
      read: false,
    }));
    if (notifications.length > 0)
      await db.collection("notifications").insertMany(notifications);
    return NextResponse.json({ ok: true, request: inserted });
  } catch (err) {
    console.error("POST /api/calendar-requests error", err);
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const forAdmin = url.searchParams.get("admin");
    const { db } = await connectToDatabase();
    if (forAdmin === "1") {
      // only admins should call this, validate header
      const headerEmail = req.headers.get("x-user-email");
      if (!headerEmail)
        return NextResponse.json({ error: "not authorized" }, { status: 403 });
      const profile = await db
        .collection("profiles")
        .findOne({ email: headerEmail });
      if (!profile || profile.role !== "admin")
        return NextResponse.json({ error: "not authorized" }, { status: 403 });
      const items = await db
        .collection("calendarRequests")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return NextResponse.json({ items });
    }
    if (!email)
      return NextResponse.json({ error: "email required" }, { status: 400 });
    const items = await db
      .collection("calendarRequests")
      .find({ requesterEmail: email })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/calendar-requests error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, adminEmail, responseMessage } = body;
    if (!id || !action)
      return NextResponse.json({ error: "id and action required" }, { status: 400 });
    const { db } = await connectToDatabase();
    // require header to match adminEmail and that user is admin
    const headerEmail = req.headers.get("x-user-email");
    if (!headerEmail || headerEmail !== adminEmail) {
      return NextResponse.json({ error: "invalid admin" }, { status: 403 });
    }
    const adminProfile = await db
      .collection("profiles")
      .findOne({ email: headerEmail });
    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "not authorized" }, { status: 403 });
    }
    const update: any = { updatedAt: new Date() };
    if (action === "approve") update.status = "approved";
    else if (action === "reject") update.status = "rejected";
    else return NextResponse.json({ error: "invalid action" }, { status: 400 });
    await db
      .collection("calendarRequests")
      .updateOne(
        { _id: new (await import("mongodb")).ObjectId(id) },
        { $set: update }
      );
    const reqDoc = await db
      .collection("calendarRequests")
      .findOne({ _id: new (await import("mongodb")).ObjectId(id) });
    // if approved, add to calendar
    if (update.status === "approved" && reqDoc) {
      await db.collection("calendarios").updateOne(
        { name: reqDoc.calendarName },
        {
          $push: {
            events: {
              title: reqDoc.title,
              start: reqDoc.start,
              end: reqDoc.end,
              description: reqDoc.description,
            },
          },
        },
        { upsert: true }
      );
    }
    // notify requester
    if (reqDoc) {
      const message =
        responseMessage ||
        (update.status === "approved"
          ? "Tu solicitud fue aprobada"
          : "Tu solicitud fue rechazada");
      await db.collection("notifications").insertOne({
        to: reqDoc.requesterEmail,
        from: adminEmail || "admin",
        message,
        createdAt: new Date(),
        read: false,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/calendar-requests error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
