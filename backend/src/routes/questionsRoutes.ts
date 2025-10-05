import express from "express";  // Importa Express para definir rutas
import candidateQuestion from "../models/candidateQuestions";
import employeeQuestion from "../models/employeeQuestions";

const router = express.Router();  // Crea un enrutador para las rutas de preguntas

// Ruta para obtener preguntas según rol con soporte para campos específicos
router.get("/:rol", async (req, res) => {  // Define la ruta GET /:rol
  try {  // Bloque try-catch para manejar la lógica
    const rol = req.params.rol;  // Obtiene el rol de los parámetros (candidate o employee)
    let PreguntaModel;  // Variable para asignar el modelo correcto
    if (rol === "candidate") {  // Si el rol es candidate
      const {default: candidateQuestion} = await import("../models/candidateQuestions.js")
      PreguntaModel = candidateQuestion;  // Usa modelo de candidatos
    } else if (rol === "employee") {  // Si el rol es employee
      const {default: employeeQuestion} = await import("../models/employeeQuestions.js")
      PreguntaModel = employeeQuestion;  // Usa modelo de empleados
    } else {  // Si el rol no es válido
      return res.status(400).json({ message: "Rol inválido" });  // Responde con error
    }

    const fields = req.query.fields as string;  // Obtiene los campos solicitados (ej: "contenido,tipo")
    let query = PreguntaModel.find();  // Inicializa la consulta

    if (fields) {  // Si se especificaron campos
      const fieldArray = fields.split(",").join(" ");  // Convierte "contenido,tipo" a "contenido tipo"
      query = query.select(fieldArray);  // Aplica proyección para seleccionar campos
    }

    const preguntas = await query.exec();  // Ejecuta la consulta y obtiene las preguntas
    res.status(200).json(preguntas);  // Responde con las preguntas
  } catch (error: unknown) {  // Captura errores
    const errorMessage = error instanceof Error ? error.message : "Error al obtener preguntas";  // Maneja mensaje
    console.error("Error al obtener preguntas:", error);  // Registra error
    res.status(500).json({ message: errorMessage });  // Responde con error
  }
});

export default router;  // Exporta el enrutador