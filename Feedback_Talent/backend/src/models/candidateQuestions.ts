import mongoose, {Schema, Document} from "mongoose";  // Importa Mongoose para definir esquemas de MongoDB

interface IPregunta extends Document {
  contenido: string;
  tipo: "rating" | "text" | "slider";
  obligatoria: boolean;
  categoria: string;
}

// Define el esquema para las preguntas de candidatos
const candidateQuestionsSchema: Schema<IPregunta> = new mongoose.Schema({  // Crea un nuevo esquema
  contenido: {  // Campo para el texto de la pregunta
    type: String,  // Tipo de dato: cadena de texto
    required: true,  // Requerido: true
  },
  tipo: {  // Campo para el tipo de pregunta (ej: 'rating', 'text')
    type: String,  // Tipo de dato: cadena
    enum: ['rating', 'text', 'slider'],  // Valores permitidos
    required: true,  // Requerido: true
  },
  obligatoria: {  // Campo para indicar si la pregunta es obligatoria
    type: Boolean,  // Tipo de dato: booleano
    default: true,  // Valor por defecto: true
  },
  categoria: {  // Campo para categorizar la pregunta (opcional)
    type: String,  // Tipo de dato: cadena
    required: true,
  },
}, { timestamps: true });  // Agrega timestamps automáticos (createdAt, updatedAt)

// Exporta el modelo para usarlo en rutas
export default mongoose.model<IPregunta>("candidateQuestions", candidateQuestionsSchema, "candidateQuestions");  // Crea y exporta el modelo 'PreguntaCandidate'