import { NextResponse } from "next/server";
import { addClient, removeClient } from "@/app/lib/broadcaster";

export async function GET(request: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Generate a simple id for this connection
  const id = Math.random().toString(36).slice(2);
  addClient(id, writer);

  // write initial comment to establish the connection
  const encoder = new TextEncoder();
  writer.write(encoder.encode(`: connected\n\n`));

  // when the connection is closed by client, cleanup
  // The runtime will call cancel on the writer when the response is aborted
  const res = new NextResponse(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });

  // Schedule cleanup when the response is finished
  (res as any).onclose = () => removeClient(id);

  return res;
}
