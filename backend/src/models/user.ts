// src/models/User.ts
import mongoose, { Schema, model, Document, Model } from "mongoose";
import argon2 from "argon2";

export type UserRole = "employee" | "candidate" | "company";

export interface IUser extends Document {
  idNumber: string;
  name: string;
  email: string;
  passwordHash: string;           // se guarda solo el hash
  role: UserRole;
  description?: string;
  birthDate: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({ /* ...campos... */ }, { timestamps: true });

UserSchema
  .virtual("password")                  // <-- campo virtual
  .set(function (this: IUser, plain: string) {
    // Guardamos temporalmente el texto plano en una prop no persistida
    (this as any)._plainPassword = plain;
  });

UserSchema.pre("validate", async function (next) {
  const self = this as IUser & { _plainPassword?: string };
  if (self._plainPassword) {
    self.passwordHash = await argon2.hash(self._plainPassword, {
      type: argon2.argon2id, timeCost: 3, memoryCost: 19456, parallelism: 1,
    });
    delete (self as any)._plainPassword;
  }
  next();
});


// Para updates tipo findOneAndUpdate, maneja aparte:
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate();
  if (update?.password || update?.$set?.password) {
    const plain = update.password ?? update.$set.password;
    const hash = await argon2.hash(plain, { type: argon2.argon2id, timeCost: 3, memoryCost: 19456, parallelism: 1 });
    if (update.password) delete update.password;
    if (update.$set?.password) delete update.$set.password;
    update.$set ??= {};
    update.$set.passwordHash = hash;
    this.setUpdate(update);
  }
  next();
});

UserSchema.methods.comparePassword = function (plain: string) {
  return argon2.verify(this.passwordHash, plain);
};

UserSchema.add({
  idNumber:     { type: String, required: true, unique: true, trim: true },
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  birthDate:    { type: Date,   required: true },
  role:         { type: String, required: true, enum: ["employee","candidate","company"] },
  description:  { type: String, trim: true },
});

UserSchema.set("toJSON", {
  transform: (_doc: unknown, ret: Record<string, any>) => {
    delete ret.passwordHash;  // oculta el hash en las respuestas
    return ret;
  },
});

const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || model<IUser>("User", UserSchema);
export default User;

