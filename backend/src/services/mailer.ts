// backend/src/services/mailer.ts
import nodemailer from "nodemailer";

// Prefer explicit SMTP_* env vars; fall back to older GMAIL_* keys for compatibility
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true") === "true";
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
const DEFAULT_FROM = process.env.MAIL_FROM || SMTP_USER || "";

if (!SMTP_USER || !SMTP_PASS) {
  console.warn(
    "[mailer] SMTP_USER/SMTP_PASS no están configurados. El envío real fallará; usando modo mock (logs)."
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export interface SendMailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendMail({ to, subject, html, from }: SendMailPayload) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.log("\n--- Mock Email (mailer disabled) ---");
    console.log("From:", from || DEFAULT_FROM);
    console.log("To:   ", to);
    console.log("Subj: ", subject);
    console.log("HTML:\n", html);
    console.log("------------------------------------\n");
    return;
  }

  await transporter.sendMail({
    from: from || DEFAULT_FROM,
    to,
    subject,
    html,
  });
}

// Verifica la conectividad/configuración del transportador SMTP. Devuelve un objeto
// con { ok: boolean, info?: any, error?: string } para ayudar en diagnósticos.
export async function verifyTransport() {
  if (!SMTP_USER || !SMTP_PASS) {
    return { ok: false, error: "SMTP credentials not configured (mock mode)" };
  }

  try {
    const info = await transporter.verify();
    return { ok: true, info };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), info: err };
  }
}
