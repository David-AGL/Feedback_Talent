// src/models/PasswordReset.ts
import mongoose, { Schema, model, Document, Model } from "mongoose";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

export type ResetStatus = "pending" | "verified" | "used" | "expired";

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  requestId: string;          // identificador público enviado al cliente
  pinHash: string;            // hash del PIN (nunca guardar el PIN en claro)
  expiresAt: Date;            // fecha de expiración (usada por el TTL)
  attemptsLeft: number;       // intentos restantes
  status: ResetStatus;        // estado de la solicitud
  verifiedAt?: Date;          // cuándo se verificó el PIN
  usedAt?: Date;              // cuándo se usó para cambiar la contraseña
  lastAttemptAt?: Date;       // fecha/hora del último intento

  // Ayudantes derivados
  isExpired(): boolean;
  canAttempt(): boolean;

  // Acciones
  verifyPin(pin: string): Promise<boolean>;
  markUsed(): Promise<void>;
}

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
      required: true,
      unique: true,
      default: uuidv4, // generamos un UUID único por solicitud
      index: true,
    },
    pinHash: {
      type: String,
      required: true,
      select: false, // no devolver por defecto en consultas
    },
    expiresAt: {
      type: Date,
      required: true,
      // el índice TTL se configura abajo; aquí solo almacenamos la fecha
    },
    attemptsLeft: {
      type: Number,
      required: true,
      default: 5,  // número de intentos permitidos
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
    lastAttemptAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "password_resets",
  }
);

/**
 * Índice TTL: elimina automáticamente el documento cuando `expiresAt` haya pasado.
 * Nota: el TTL es independiente del `status`; MongoDB lo purgará tras la fecha.
 */
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Índice compuesto útil para listar/buscar por usuario y estado.
 */
PasswordResetSchema.index({ userId: 1, status: 1, createdAt: -1 });

/**
 * Valores por defecto y guardas básicas antes de validar.
 */
PasswordResetSchema.pre("validate", function (next) {
  const self = this as IPasswordReset & { isNew: boolean };

  // Si no se fijó expiresAt, por defecto ahora + 10 minutos
  if (!self.expiresAt) {
    self.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }

  // Evitar guardar expiraciones en el pasado por error
  if (self.expiresAt.getTime() <= Date.now()) {
    return next(new Error("expiresAt debe ser una fecha futura"));
  }

  // Si ya no hay intentos y el estado está en pending, marcar como expirado
  if (self.attemptsLeft <= 0 && self.status === "pending") {
    self.status = "expired";
  }

  next();
});

/**
 * Helper: indica si la solicitud está expirada por tiempo o estado.
 */
PasswordResetSchema.methods.isExpired = function (): boolean {
  return this.expiresAt.getTime() <= Date.now() || this.status === "expired";
};

/**
 * Helper: verifica si se puede intentar un PIN (estado, tiempo e intentos).
 */
PasswordResetSchema.methods.canAttempt = function (): boolean {
  return (
    this.status === "pending" &&
    !this.isExpired() &&
    typeof this.attemptsLeft === "number" &&
    this.attemptsLeft > 0
  );
};

/**
 * Verificar un PIN:
 * - Devuelve true si es correcto: pone status=verified y fija verifiedAt.
 * - Devuelve false si es incorrecto: decrementa attemptsLeft y expira si corresponde.
 * - Si no se puede intentar (expirado o sin intentos), marca expirado en pending.
 */
PasswordResetSchema.methods.verifyPin = async function (
  pin: string
): Promise<boolean> {
  // Asegurar que `pinHash` está cargado (select: false por defecto)
  if (typeof this.pinHash !== "string") {
    // Si no está presente, recargar el documento incluyendo el hash
    const fresh = await (this.constructor as Model<IPasswordReset>)
      .findById(this._id)
      .select("+pinHash");
    if (!fresh) return false;
    // Delegar la verificación al documento recargado
    return fresh.verifyPin(pin);
  }

  // ¿No se puede intentar?
  if (!this.canAttempt()) {
    if (this.status === "pending") {
      this.status = "expired";
    }
    await this.save();
    return false;
  }

  const ok = await argon2.verify(this.pinHash, pin);
  this.lastAttemptAt = new Date();

  if (ok) {
    this.status = "verified";
    this.verifiedAt = new Date();
    await this.save();
    return true;
  }

  // PIN incorrecto: restar un intento
  this.attemptsLeft = Math.max(0, (this.attemptsLeft || 0) - 1);

  // Si se agotaron los intentos o ya expiró por tiempo, marcar como expirado
  if (this.attemptsLeft <= 0 || this.isExpired()) {
    this.status = "expired";
  }

  await this.save();
  return false;
};

/**
 * Marcar como usado después de un cambio de contraseña exitoso.
 * Solo válido si está `verified` y no expirado.
 */
PasswordResetSchema.methods.markUsed = async function (): Promise<void> {
  if (this.status !== "verified" || this.isExpired()) {
    throw new Error("La solicitud de restablecimiento no está en un estado utilizable");
  }
  this.status = "used";
  this.usedAt = new Date();
  await this.save();
};

const PasswordReset: Model<IPasswordReset> =
  (mongoose.models.PasswordReset as Model<IPasswordReset>) ||
  model<IPasswordReset>("PasswordReset", PasswordResetSchema);

export default PasswordReset;
