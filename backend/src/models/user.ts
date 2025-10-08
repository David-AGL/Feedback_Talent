// src/models/User.ts
import mongoose, { Schema, model, Document, Model } from "mongoose";
import argon2 from "argon2";

export type UserRole = "employee" | "candidate" | "company";

export interface IUser extends Document {
  idNumber: string;
  name: string;
  email: string;
  passwordHash: string; // solo guardamos el hash
  role: UserRole;
  description?: string;
  birthDate?: Date; // requerido condicionalmente por schema
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    idNumber: { type: String, required: true, unique: true, trim: true },

    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // NO required aquí, porque se valida antes del pre('save').
    passwordHash: { type: String, select: false },

    // Requerido solo para employee/candidate
    birthDate: {
      type: Date,
      required: function (this: any) {
        return this.role !== "company";
      },
    },

    role: {
      type: String,
      required: true,
      enum: ["employee", "candidate", "company"],
    },

    description: {
      type: String,
      trim: true,
      set: (v: unknown) =>
        typeof v === "string" && v.trim() === "" ? undefined : v,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------
// Virtual password (campo temporal del request)
// ---------------------------
UserSchema.virtual("password")
  .set(function (this: any, plain: string) {
    this._plainPassword = plain;
  })
  .get(function (this: any) {
    return this._plainPassword;
  });

// ---------------------------
// VALIDACIÓN y HASH antes de validar el schema
// (se ejecuta antes de que Mongoose aplique "required")
// ---------------------------
UserSchema.pre("validate", async function (next) {
  const self = this as any;

  // Si llegó password plano, generamos el hash aquí
  if (self._plainPassword) {
    try {
      self.passwordHash = await argon2.hash(self._plainPassword);
      delete self._plainPassword;
    } catch (err) {
      return next(err as any);
    }
  }

  // Documento nuevo: exigir que exista passwordHash (ya sea por password o directo)
  if (self.isNew && !self.passwordHash) {
    self.invalidate("passwordHash", "Path `passwordHash` is required.");
  }

  next();
});

// ---------------------------
// Updates: permitir enviar password en claro
// ---------------------------
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate() || {};
  const pwd = update.password ?? update.$set?.password;

  if (pwd) {
    try {
      const hash = await argon2.hash(pwd);
      if (update.password) delete update.password;
      if (update.$set?.password) delete update.$set.password;

      update.$set ??= {};
      update.$set.passwordHash = hash;

      this.setUpdate(update);
    } catch (err) {
      return next(err as any);
    }
  }

  // Necesario para que funcionen los required condicionales en updates
  (this as any).setOptions({ runValidators: true, context: "query" });
  next();
});

// ---------------------------
// Métodos
// ---------------------------
UserSchema.methods.comparePassword = function (plain: string) {
  return argon2.verify(this.passwordHash, plain);
};

// ---------------------------
// toJSON: ocultar passwordHash
// ---------------------------
UserSchema.set("toJSON", {
  transform: (_doc: unknown, ret: Record<string, any>) => {
    delete ret.passwordHash;
    return ret;
  },
});

// ---------------------------
// Export
// ---------------------------
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || model<IUser>("User", UserSchema);

export default User;
