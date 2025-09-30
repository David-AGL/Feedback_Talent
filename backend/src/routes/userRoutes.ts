import { Router } from "express";
import Usuario from "../models/user.js";

const userRoutes = Router();

// Registrar usuario
userRoutes.post("/register", async (req, res) => { 
  try {
    const { numeroIdentificacion, nombre, email, contrasena, fechaNacimiento, rol, descripcion } = req.body;

    // Validaciones simples
    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Crear usuario
    const nuevoUsuario = new Usuario({
      numeroIdentificacion,
      nombre,
      email,
      contrasena, // luego deberíamos encriptar con bcrypt
      fechaNacimiento,
      rol,
      descripcion, 
      
    });

    await nuevoUsuario.save();

    res.status(201).json({ message: "Usuario creado con éxito", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

export default userRoutes;