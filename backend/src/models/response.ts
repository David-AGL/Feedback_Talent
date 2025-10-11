import mongoose, { Schema, model, Document } from "mongoose";

export interface IResponse extends Document {
  userId: mongoose.Types.ObjectId; // Usuario que responde (employee/candidate)
  companyUserId: mongoose.Types.ObjectId; // Usuario con rol "company" que se está calificando
  questionId: mongoose.Types.ObjectId; // ID de la pregunta
  answer: string | number; // Respuesta
  role: "employee" | "candidate"; // Rol del que responde
  categoria: string; // Categoría de la pregunta
  createdAt: Date;
  updatedAt: Date;
}

const ResponseSchema = new Schema<IResponse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "candidate"],
      required: true,
      index: true,
    },
    categoria: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para evitar respuestas duplicadas
ResponseSchema.index({ userId: 1, companyUserId: 1, questionId: 1 }, { unique: true });
ResponseSchema.index({ companyUserId: 1, categoria: 1 }); // Para análisis

const Response = mongoose.models.Response || model<IResponse>("Response", ResponseSchema);

export default Response;