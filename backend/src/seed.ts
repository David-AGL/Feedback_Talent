import mongoose from "mongoose";  // Importa Mongoose para conectar y definir modelos
import { connectDB } from "./config/db.js";  // Importa la función de conexión a MongoDB

// Conectar BD
//connectDB();

// Importa los modelos con tipado
import candidateQuestion from "./models/candidateQuestions.js";  // Modelo para preguntas de candidatos
import employeeQuestion from "./models/employeeQuestions.js";  // Modelo para preguntas de empleados

// Define las interfaces para las preguntas
interface IPregunta {
  contenido: string;  // Texto de la pregunta
  tipo: "rating" | "text" | "slider";  // Tipo de respuesta
  obligatoria: boolean;  // Obligatoria o no
  categoria: string;  // Categoría
}

// Preguntas iniciales para candidatos
const candidateQuestions: IPregunta[] = [  // Array tipado de preguntas para candidatos
  {
    contenido: "¿Cómo calificaría la claridad de la información recibida sobre el cargo y sus responsabilidades?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  {
    contenido: "¿Cómo evaluaría la transparencia del proceso de selección (tiempos, etapas, comunicación)?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  {
    contenido: "¿Qué tan satisfecho(a) quedó con la comunicación y el feedback recibido durante el proceso?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  {
    contenido: "¿El tiempo total del proceso de selección le pareció demasiado prolongado?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  {
    contenido: "¿Cómo calificaría la imparcialidad y justicia del proceso?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  {
    contenido: "¿Se sintió completamente informado durante todo el proceso de selección?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  {
    contenido: "¿Se ajustan las preguntas y pruebas al rol de la vacante?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Proceso de selección",
  },
  // Categoría 2: Cultura empresarial percibida
  {
    contenido: "Durante el proceso, ¿qué percepción tuvo sobre el ambiente laboral y la cultura de la empresa?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Cultura empresarial percibida",
  },
  {
    contenido: "¿Sintió que los valores de la empresa fueron comunicados claramente?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Cultura empresarial percibida",
  },
  // Categoría 3: Salario y beneficios (percepción inicial)
  {
    contenido: "¿Qué tan clara fue la comunicación respecto al rango salarial y beneficios del cargo?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Salario y beneficios (percepción inicial)",
  },
  {
    contenido: "¿Considera que el paquete salarial y de beneficios presentado fue competitivo en comparación con el mercado?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Salario y beneficios (percepción inicial)",
  },
  // Categoría 4: Prospectiva profesional
  {
    contenido: "¿Percibió oportunidades de desarrollo profesional dentro de la empresa?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Prospectiva profesional",
  },
  {
    contenido: "¿Recomendaría participar en futuros procesos de selección de esta empresa?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Prospectiva profesional",
  },
  // Pregunta abierta
  {
    contenido: "¿Qué sugerencias haría para mejorar la experiencia de los candidatos en el proceso de selección?",
    tipo: "text",
    obligatoria: false,
    categoria: "Pregunta abierta",
  },
];

// Preguntas iniciales para empleados
const employeeQuestions: IPregunta[] = [  // Array tipado de preguntas para empleados
  // Categoría 1: Salarios y beneficios
  {
    contenido: "¿Qué tan satisfecho(a) está con la compensación económica actual?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Salarios y beneficios",
  },
  {
    contenido: "¿Considera que los beneficios adicionales (salud, educación, flexibilidad, etc.) cubren sus necesidades?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Salarios y beneficios",
  },
  {
    contenido: "¿Cómo calificaría la puntualidad y precisión de los pagos?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Salarios y beneficios",
  },
  // Categoría 2: Cultura empresarial y ambiente laboral
  {
    contenido: "¿Cómo calificaría el clima laboral en su área de trabajo?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Cultura empresarial y ambiente laboral",
  },
  {
    contenido: "¿Cree que la cultura y valores de la empresa se practican de manera real y no solo en el discurso?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Cultura empresarial y ambiente laboral",
  },
  {
    contenido: "¿Qué tan conectado se siente con los valores y la misión de la empresa?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Cultura empresarial y ambiente laboral",
  },
  // Categoría 3: Desarrollo y prospectiva profesional
  {
    contenido: "¿Qué tan satisfecho(a) está con las oportunidades de capacitación y crecimiento dentro de la empresa?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Desarrollo y prospectiva profesional",
  },
  {
    contenido: "¿Siente que la empresa promueve planes de carrera claros y accesibles para los empleados?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Desarrollo y prospectiva profesional",
  },
  // Categoría 4: Procesos internos y gestión
  {
    contenido: "¿Qué tan efectivos considera los procesos internos de comunicación en la empresa?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Procesos internos y gestión",
  },
  {
    contenido: "¿Cómo calificaría la eficiencia de los procesos administrativos (nómina, permisos, evaluaciones, etc.)?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Procesos internos y gestión",
  },
  {
    contenido: "¿La organización ha proporcionado en todo momento las herramientas que necesita para completar sus funciones correctamente?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Procesos internos y gestión",
  },
  // Categoría 5: Motivación y compromiso
  {
    contenido: "¿Se siente motivado(a) y reconocido(a) en su rol dentro de la organización?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Motivación y compromiso",
  },
  {
    contenido: "¿Recomendaría la empresa como un buen lugar para trabajar?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Motivación y compromiso",
  },
  {
    contenido: "¿Considera que la empresa promueve un equilibrio saludable entre el trabajo y la vida personal?",
    tipo: "rating",
    obligatoria: true,
    categoria: "Motivación y compromiso",
  },
  // Pregunta abierta
  {
    contenido: "¿Qué mejoras considera necesarias para que la empresa sea un mejor lugar de trabajo?",
    tipo: "text",
    obligatoria: false,
    categoria: "Pregunta abierta",
  },
];

// Función para insertar preguntas
async function seedQuestions(): Promise<void> {  // Función asíncrona con tipado de retorno
  try {  // Bloque try-catch para manejar errores
    await connectDB();
    await candidateQuestion.insertMany(candidateQuestions);  // Inserta preguntas para candidatos
    await employeeQuestion.insertMany(employeeQuestions);  // Inserta preguntas para empleados
    console.log("Preguntas iniciales insertadas exitosamente");  // Mensaje de éxito
  } catch (error: unknown) {  // Captura errores con tipado
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al insertar preguntas";  // Maneja mensaje
    console.error("Error insertando preguntas:", errorMessage);  // Registra error
  } finally {  // Finaliza
    await mongoose.connection.close();  // Cierra la conexión
  }
}

// Ejecuta la función
seedQuestions().catch(console.error);  // Llama a la función y maneja errores

// Para correr el archivo:
// node --loader ts-node/esm src/seed.ts
