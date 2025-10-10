// src/models/PasswordReset.ts
import mongoose, { Schema, model, Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type ResetStatus = "pending" | "verified" | "used" | "expired";

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  requestId: string;                // identificador público enviado al cliente
  pinHash: string;                  // hash del PIN (nunca guardar el PIN en claro)
  expiresAt: Date;                  // fecha límite del PIN
  attemptsLeft: number;             // intentos restantes para el PIN
  status: ResetStatus;              // estado de la solicitud
  verifiedAt?: Date;                // cuándo se verificó el PIN
  usedAt?: Date;                    // cuándo se usó para cambiar la contraseña
  resetToken?: string;              // token posterior a verificar el PIN
  resetTokenExpiresAt?: Date;       // vencimiento del resetToken

  // Métodos de instancia
  isExpired(): boolean;
  decrementAttempts(): Promise<void>;
  resetPin(newPinHash: string, ttlMin: number, attempts: number): Promise<void>;
  markVerified(resetToken: string, ttlMin: number): Promise<void>;
  markUsed(): Promise<void>;
}

const DEFAULT_MAX_ATTEMPTS = Number(process.env.RESET_MAX_ATTEMPTS || 5);

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
      required: true,
    },
    pinHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // El TTL real se configura con el índice al final del archivo
    },
    attemptsLeft: {
      type: Number,
      required: true,
      default: DEFAULT_MAX_ATTEMPTS,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "used", "expired"],
      required: true,
      default: "pending",
      index: true,
    },
    verifiedAt: { type: Date },
    usedAt: { type: Date },
    resetToken: { type: String, index: true },
    resetTokenExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// --- Métodos de instancia ---
PasswordResetSchema.methods.isExpired = function (): boolean {
  return !!this.expiresAt && this.expiresAt.getTime() <= Date.now();
};

PasswordResetSchema.methods.decrementAttempts = async function (): Promise<void> {
  const left = typeof this.attemptsLeft === "number" ? this.attemptsLeft : DEFAULT_MAX_ATTEMPTS;
  this.attemptsLeft = Math.max(0, left - 1);
  await this.save();
};

PasswordResetSchema.methods.resetPin = async function (
  newPinHash: string,
  ttlMin: number,
  attempts: number
): Promise<void> {
  this.pinHash = newPinHash;
  this.expiresAt = new Date(Date.now() + Math.max(1, ttlMin) * 60 * 1000);
  this.attemptsLeft = Math.max(1, attempts);
  this.status = "pending";
  await this.save();
};

PasswordResetSchema.methods.markVerified = async function (
  resetToken: string,
  ttlMin: number
): Promise<void> {
  this.status = "verified";
  this.verifiedAt = new Date();
  this.resetToken = resetToken;
  this.resetTokenExpiresAt = new Date(Date.now() + Math.max(1, ttlMin) * 60 * 1000);
  await this.save();
};

PasswordResetSchema.methods.markUsed = async function (): Promise<void> {
  if (this.status !== "verified" || this.isExpired()) {
    throw new Error("La solicitud de restablecimiento no está en un estado utilizable");
  }
  this.status = "used";
  this.usedAt = new Date();
  await this.save();
};

// Índices útiles
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: cuando llegue la fecha, Mongo eliminará el doc
PasswordResetSchema.index({ userId: 1, status: 1 });

const PasswordReset: Model<IPasswordReset> =
  (mongoose.models.PasswordReset as Model<IPasswordReset>) ||
  model<IPasswordReset>("PasswordReset", PasswordResetSchema);

export default PasswordReset;
