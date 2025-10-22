// Simple in-memory SSE broadcaster.
// Note: This approach keeps connections in memory and is suitable for local/dev or Node server
// deployments. For serverless or multi-instance setups use a hosted pub/sub (Redis, Pusher, etc.).

const clients = new Map<string, any>();

export function addClient(id: string, writer: any) {
  clients.set(id, writer);
}

export function removeClient(id: string) {
  try {
    const w = clients.get(id);
    if (w) {
      try {
        w.close();
      } catch (e) {}
    }
  } finally {
    clients.delete(id);
  }
}

function formatEvent(event: string, data: any) {
  return `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
}

export function publish(event: string, data: any) {
  const payload = formatEvent(event, data);
  const encoder = new TextEncoder();
  for (const [id, writer] of clients.entries()) {
    try {
      writer.write(encoder.encode(payload));
    } catch (e) {
      // remove broken client
      removeClient(id);
    }
  }
}

export function heartbeat() {
  const encoder = new TextEncoder();
  for (const [id, writer] of clients.entries()) {
    try {
      writer.write(encoder.encode(`: ping\n\n`));
    } catch (e) {
      removeClient(id);
    }
  }
}
