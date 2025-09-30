import mongoose, { Schema, Document } from "mongoose";

export interface IUsuario extends Document {
  numeroIdentificacion: string; 
  nombre: string;
  email: string;
  contrasena: string;
  rol: string;
  descripcion?: string;
  fechaNacimiento: Date;

}

const UserSchema: Schema = new Schema(
  {
    numeroIdentificacion: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    rol: { type: String, required: true, enum:["employee", "candidate", "company"] },
    descripcion: { type: String },

  },
  { timestamps: true }
);

export default mongoose.model<IUsuario>("User", UserSchema);
