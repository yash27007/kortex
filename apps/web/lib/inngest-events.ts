/**
 * Sends an event to the Inngest dev/cloud server, which routes it to the
 * matching function registered by apps/core (Python). Fire-and-forget by
 * design: a failed send here should never block the user-facing mutation
 * that triggered it (e.g. quiz submission) — it just means a background
 * enrichment (like weakness-profile analysis) won't run this time.
 */
export async function sendInngestEvent(
  name: string,
  data: Record<string, unknown>
): Promise<void> {
  // The event-ingestion endpoint is `/e/<event key>` — NOT `/api/v1/events`,
  // which 200s with the dashboard's HTML shell instead of 404ing, making the
  // wrong endpoint look like it worked. In local dev the key can be any
  // non-empty string; set INNGEST_EVENT_KEY for a real deployment.
  const inngestEventKey = process.env.INNGEST_EVENT_KEY || "local";
  const inngestUrl = process.env.INNGEST_URL || "http://localhost:8288";

  try {
    const response = await fetch(`${inngestUrl}/e/${inngestEventKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data }),
    });

    if (!response.ok) {
      console.error(
        `[inngest-events] Failed to send "${name}":`,
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error(`[inngest-events] Error sending "${name}":`, error);
  }
}
