// backend/src/services/mailer.ts
import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER ?? "";
const pass = process.env.GMAIL_APP_PASSWORD ?? "";
const defaultFrom = process.env.MAIL_FROM ?? process.env.GMAIL_USER ?? "";

// Validación temprana (no truena en dev, pero avisa)
if (!user || !pass) {
  console.warn(
    "[mailer] GMAIL_USER o GMAIL_APP_PASSWORD no están configurados. " +
      "El envío real fallará; revisa tu backend/.env"
  );
}

// Transport Gmail (SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // 465 = SSL
  auth: { user, pass },
});

export interface SendMailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Enviar correo (promesa)
export async function sendMail({ to, subject, html, from }: SendMailPayload) {
  if (!user || !pass) {
    // Entorno sin credenciales: log “mock” para desarrollo
    console.log("\n--- Mock Email (mailer disabled) ---");
    console.log("To:   ", to);
    console.log("Subj: ", subject);
    console.log("HTML:\n", html);
    console.log("------------------------------------\n");
    return;
  }

  await transporter.sendMail({
    from: from || defaultFrom,
    to,
    subject,
    html,
  });
}
