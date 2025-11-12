// src/routes/passwordReset.ts
import { Router, Request, Response } from "express";
import argon2 from "argon2";
import { randomInt } from "crypto";
import PasswordReset from "../models/PasswordReset"; // ajusta la ruta si tu estructura es distinta
import User from "../models/user"; // ajusta la ruta/nombre a tu modelo real de usuario
import { sendMail } from "../services/mailer"; // debe exportar sendMail({ to, subject, html })

const router = Router();

// ---- Config vía ENV ----
const PIN_LENGTH = Number(process.env.RESET_PIN_LENGTH || 6); // 6 dígitos
const PIN_TTL_MIN = Number(process.env.RESET_PIN_TTL_MIN || 1);
const RESET_TOKEN_TTL_MIN = Number(process.env.RESET_TOKEN_TTL_MIN || 15);
const MAX_ATTEMPTS = Number(process.env.RESET_MAX_ATTEMPTS || 5);
const APP_NAME = process.env.APP_NAME || "Feedback Talent";

function generatePin(): string {
  const min = 10 ** (PIN_LENGTH - 1);
  const max = 10 ** PIN_LENGTH - 1;
  return String(randomInt(min, max + 1)).padStart(PIN_LENGTH, "0");
}

function ok(res: Response, payload: any) {
  return res.json(payload);
}

function bad(res: Response, message: string, code = 400) {
  return res.status(code).json({ error: message });
}

// ----------------------------------------------------------------------------
// POST /forgot-password  -> { message, requestId }
// ----------------------------------------------------------------------------
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return bad(res, "Email requerido");

    const user = await (User as any).findOne({ email });

    // Responder 200 siempre para no filtrar si el email existe o no
    if (!user) return ok(res, { message: "If exists, email sent" });

    // Invalidar solicitudes anteriores
    await PasswordReset.updateMany(
      { userId: user._id, status: { $in: ["pending", "verified"] } },
      { $set: { status: "expired" } }
    );

    const pin = generatePin();
    const pinHash = await argon2.hash(pin);

    const doc = await PasswordReset.create({
      userId: user._id,
      pinHash,
      attemptsLeft: MAX_ATTEMPTS,
      expiresAt: new Date(Date.now() + PIN_TTL_MIN * 60 * 1000),
      status: "pending",
      // requestId se genera en el modelo con uuidv4
    });

    try {
      await sendMail({
        to: email,
        subject: `${APP_NAME} · Recuperación de contraseña`,
        html: `
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Tu PIN es: <b style="font-size:20px">${pin}</b></p>
          <p>ID de solicitud: <code>${doc.requestId}</code></p>
          <p>Este código vence en ${PIN_TTL_MIN} minutos.</p>
          <p>Si no fuiste tú, ignora este correo.</p>
        `,
      });
    } catch (mailErr) {
      console.error("/forgot-password sendMail error", mailErr);
      // opcional: marcar la solicitud como expired para evitar uso accidental
      await PasswordReset.findByIdAndUpdate(doc._id, { status: "expired" }).catch(() => {});
      return bad(res, "No se pudo enviar el correo de recuperación", 500);
    }

    return ok(res, { message: "PIN sent", requestId: doc.requestId });
  } catch (err) {
    console.error("/forgot-password error", err);
    return bad(res, "No se pudo iniciar el proceso", 500);
  }
});

// ----------------------------------------------------------------------------
// POST /verify-pin  -> { resetToken }
// ----------------------------------------------------------------------------
router.post("/verify-pin", async (req: Request, res: Response) => {
  try {
    const requestId = String(req.body?.requestId || "").trim();
    const pin = String(req.body?.pin || "").replace(/\s+/g, "").trim();
    if (!requestId || !pin) return bad(res, "requestId y pin son requeridos");

    const doc = await PasswordReset.findOne({ requestId });
    if (!doc || doc.status !== "pending") return bad(res, "PIN inválido");
    if (doc.isExpired()) return bad(res, "PIN expirado");
    if ((doc.attemptsLeft || 0) <= 0) return bad(res, "Demasiados intentos");

    const match = await argon2.verify(doc.pinHash, pin);
    await doc.decrementAttempts();
    if (!match) return bad(res, "PIN inválido");

    const resetToken = await argon2.hash(`${doc.requestId}:${Date.now()}`);
    await doc.markVerified(resetToken, RESET_TOKEN_TTL_MIN);

    return ok(res, { resetToken });
  } catch (err) {
    console.error("/verify-pin error", err);
    return bad(res, "No se pudo verificar el PIN", 500);
  }
});

// ----------------------------------------------------------------------------
// POST /resend-pin  -> { message }
// ----------------------------------------------------------------------------
router.post("/resend-pin", async (req: Request, res: Response) => {
  try {
    const requestId = String(req.body?.requestId || "").trim();
    if (!requestId) return bad(res, "requestId requerido");

    const doc = await PasswordReset.findOne({ requestId }).populate("userId");
    if (!doc || doc.status !== "pending") return bad(res, "Solicitud inválida");

    const pin = generatePin();
    const pinHash = await argon2.hash(pin);
    await doc.resetPin(pinHash, PIN_TTL_MIN, MAX_ATTEMPTS);

    const user: any = (doc as any).userId;
    try {
      await sendMail({
        to: user.email,
        subject: `${APP_NAME} · Nuevo PIN de recuperación`,
        html: `
          <p>Tu nuevo PIN es: <b style="font-size:20px">${pin}</b></p>
          <p>ID de solicitud: <code>${doc.requestId}</code></p>
        `,
      });
    } catch (mailErr) {
      console.error("/resend-pin sendMail error", mailErr);
      return bad(res, "No se pudo reenviar el PIN", 500);
    }

    return ok(res, { message: "PIN reenviado" });
  } catch (err) {
    console.error("/resend-pin error", err);
    return bad(res, "No se pudo reenviar el PIN", 500);
  }
});

// ----------------------------------------------------------------------------
// POST /reset-password  -> { message }
// ----------------------------------------------------------------------------
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const resetToken = String(req.body?.resetToken || "").trim();
    const newPassword = String(req.body?.newPassword || ""); 
    if (!resetToken || newPassword.length < 8) return bad(res, "Datos inválidos");

    const doc = await PasswordReset.findOne({ resetToken, status: "verified" });
    if (!doc) return bad(res, "Token inválido o ya usado");
    if (!doc.resetTokenExpiresAt || doc.resetTokenExpiresAt.getTime() <= Date.now()) {
      return bad(res, "Token expirado");
    }

    const user = await (User as any).findById(doc.userId);
    if (!user) return bad(res, "Usuario no encontrado");

    // Actualiza la contraseña (tu modelo/servicio debe hashearla en un hook)
    (user as any).password = newPassword;
    await user.save();

    await doc.markUsed();
    await PasswordReset.updateMany(
      { userId: doc.userId, status: { $in: ["pending", "verified"] }, _id: { $ne: doc._id } },
      { $set: { status: "expired" } }
    );

    return ok(res, { message: "Password updated" });
  } catch (err) {
    console.error("/reset-password error", err);
    return bad(res, "No se pudo restablecer la contraseña", 500);
  }
});

export default router;
