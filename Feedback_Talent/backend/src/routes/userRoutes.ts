import express from "express";  // Importa Express para definir rutas
import { connectDB } from "../config/db.js";  // Importa la conexión a MongoDB (opcional aquí, pero útil para inicialización)

const router = express.Router();  // Crea un enrutador para las rutas de usuarios

// Conectar a la base de datos (opcional, ya se hace en server.ts)
connectDB();

// Ruta para registrar usuarios
router.post("/register", async (req, res) => {  // Define la ruta POST /register
  try {  // Bloque try-catch para manejar la lógica
    const { numeroIdentificacion, nombre, email, contrasena, fechaNacimiento, rol, descripcion } = req.body;  // Extrae datos del cuerpo
    const User = require("../models/User");  // Importa dinámicamente el modelo User
    const newUser = new User({  // Crea una nueva instancia del modelo
      numeroIdentificacion,
      nombre,
      email,
      contrasena,  // Nota: Hashea en producción
      fechaNacimiento: fechaNacimiento || null,
      rol,
      descripcion,
    });
    const savedUser = await newUser.save();  // Guarda en MongoDB
    res.status(201).json({ message: "Usuario registrado exitosamente", user: savedUser });  // Responde con éxito
  } catch (error: unknown) {  // Captura errores
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al registrar usuario";  // Maneja mensaje
    console.error("Error al registrar:", error);  // Registra error
    res.status(400).json({ message: errorMessage });  // Responde con error
  }
});

export default router;  // Exporta el enrutador para usarlo en server.ts