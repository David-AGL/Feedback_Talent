import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /profile/:userId
 * Obtener información del perfil de un usuario (candidato o empleado)
 */
router.get("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Un usuario puede ver su propio perfil, y una empresa puede ver cualquier perfil
    if (decoded.role !== 'company' && decoded.userId !== userId) {
      return res.status(403).json({ message: "No tienes permiso para ver este perfil" });
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error obteniendo perfil de usuario:", error);
    return res.status(500).json({ message: "Error al obtener perfil" });
  }
});

/**
 * PUT /profile/:userId
 * Actualizar información del perfil de un usuario
 */
router.put("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Un usuario puede actualizar su propio perfil, y una empresa puede actualizar cualquier perfil
    if (decoded.role !== 'company' && decoded.userId !== userId) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este perfil" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, role },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error actualizando perfil de usuario:", error);
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
});

export default router;
