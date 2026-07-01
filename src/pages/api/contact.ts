import type { APIRoute } from "astro";
import { Resend } from "resend";

const rateLimitMap = new Map<string, number>();

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request }) => {
  // Rate limit: 1 submission per IP per minute
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const lastSubmit = rateLimitMap.get(ip);
  if (lastSubmit && now - lastSubmit < 60_000) {
    return json({ error: "rateLimit" }, 429);
  }
  rateLimitMap.set(ip, now);

  const data = await request.formData();

  // Honeypot: bots fill this, humans don't see it
  if (data.get("website")) {
    return json({ success: true, name: "" });
  }

  const name = data.get("name")?.toString().trim() ?? "";
  const email = data.get("email")?.toString().trim() ?? "";
  const phone = data.get("phone")?.toString().trim() ?? "";
  const date = data.get("date")?.toString().trim() ?? "";
  const location = data.get("location")?.toString().trim() ?? "";
  const eventType = data.get("eventType")?.toString().trim() ?? "";
  const guestCount = data.get("guestCount")?.toString().trim() ?? "";
  const drinks = data
    .getAll("drinks")
    .map((d) => d.toString())
    .join(", ");
  const power = data.get("power")?.toString().trim() ?? "";
  const message = data.get("message")?.toString().trim() ?? "";

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !name ||
    !email ||
    !emailRe.test(email) ||
    !phone ||
    !date ||
    !location ||
    !eventType ||
    !guestCount
  ) {
    return json({ error: "validation" }, 400);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const ownerEmail = process.env.OWNER_EMAIL as string;
  const timestamp = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
  });

  const ownerHtml = `
    <h2>Neue Eventanfrage von ${esc(name)}</h2>
    <p><strong>Eingegangen:</strong> ${timestamp}</p>
    <hr />
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>E-Mail:</strong> ${esc(email)}</p>
    <p><strong>Telefon:</strong> ${esc(phone)}</p>
    <p><strong>Event-Datum:</strong> ${esc(date)}</p>
    <p><strong>Ort:</strong> ${esc(location)}</p>
    <p><strong>Art des Events:</strong> ${esc(eventType)}</p>
    <p><strong>Gästezahl:</strong> ${esc(guestCount)}</p>
    <p><strong>Getränke:</strong> ${esc(drinks) || "–"}</p>
    <p><strong>Strom 220V:</strong> ${esc(power) || "–"}</p>
    <p><strong>Nachricht:</strong><br />${esc(message) || "–"}</p>
  `;

  const confirmHtml = `
    <h2>Danke für deine Anfrage, ${esc(name)}!</h2>
    <p>Ich habe deine Angaben erhalten und melde mich innerhalb eines Werktages mit einer ersten Einschätzung und einem passenden Vorschlag für dein Event.</p>
    <br />
    <p>Bis bald,<br />Benedikt von MANNA</p>
  `;

  const ownerResult = await resend.emails.send({
    from: "MANNA <hallo@manna-kaffeebar.de>",
    to: ownerEmail,
    subject: `Neue Eventanfrage von ${name}`,
    html: ownerHtml,
  });
  if (ownerResult.error) {
    console.error("Owner email failed:", JSON.stringify(ownerResult.error));
    return json({ error: "email" }, 500);
  }

  const confirmResult = await resend.emails.send({
    from: "MANNA <hallo@manna-kaffeebar.de>",
    to: email,
    subject: "Deine Anfrage bei MANNA",
    html: confirmHtml,
  });
  if (confirmResult.error) {
    console.error(
      "Confirmation email failed:",
      JSON.stringify(confirmResult.error)
    );
  }

  return json({ success: true, name: name.split(" ")[0] });
};
