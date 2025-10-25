import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import ResponseModel from "../models/response";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /profile/:companyUserId
 * Obtener información completa del perfil de una empresa
 */
router.get("/profile/:companyUserId", async (req: Request, res: Response) => {
  try {
    const { companyUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyUserId)) {
      return res.status(400).json({ message: "ID de empresa inválido" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    // Verificar token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Obtener información de la empresa
    const company = await User.findById(companyUserId).select("-passwordHash");

    if (!company || company.role !== "company") {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    // Verificar permisos: solo la empresa misma o usuarios pueden ver el perfil
    const requesterId = decoded.userId;
    const requesterRole = decoded.role;

    if (
      requesterRole !== "employee" &&
      requesterRole !== "candidate" &&
      requesterId !== companyUserId
    ) {
      return res.status(403).json({ 
        message: "No tienes permiso para ver este perfil" 
      });
    }

    return res.status(200).json(company);
  } catch (error) {
    console.error("Error obteniendo perfil de empresa:", error);
    return res.status(500).json({ message: "Error al obtener perfil" });
  }
});

/**
 * GET /stats/:companyUserId
 * Obtener estadísticas agrupadas por categoría para una empresa
 */
router.get("/stats/:companyUserId", async (req: Request, res: Response) => {
  try {
    const { companyUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyUserId)) {
      return res.status(400).json({ message: "ID de empresa inválido" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    // Verificar token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const objectId = new mongoose.Types.ObjectId(companyUserId);

    // Agregación para obtener promedios por categoría
    const categoryStats = await ResponseModel.aggregate([
      { 
        $match: { 
          companyUserId: objectId,
          answer: { $type: "number" } // Solo respuestas numéricas
        } 
      },
      {
        $group: {
          _id: "$categoria",
          avgScore: { $avg: "$answer" },
          count: { $sum: 1 },
          role: { $first: "$role" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json(categoryStats);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

/**
 * GET /stats/:companyUserId/category/:categoria
 * Obtener estadísticas detalladas por pregunta dentro de una categoría
 */
router.get("/stats/:companyUserId/category/:categoria", async (req: Request, res: Response) => {
  try {
    const { companyUserId, categoria } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyUserId)) {
      return res.status(400).json({ message: "ID de empresa inválido" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    // Verificar token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const objectId = new mongoose.Types.ObjectId(companyUserId);

    // Agregación para obtener promedios por pregunta en una categoría
    const questionStats = await ResponseModel.aggregate([
      { 
        $match: { 
          companyUserId: objectId,
          categoria: categoria,
          answer: { $type: "number" }
        } 
      },
      {
        $group: {
          _id: "$questionId",
          avgScore: { $avg: "$answer" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Obtener detalles de las preguntas
    const candidateQuestions = (await import("../models/candidateQuestions")).default;
    const employeeQuestions = (await import("../models/employeeQuestions")).default;

    const detailedStats = await Promise.all(
      questionStats.map(async (stat) => {
        let question = await candidateQuestions.findById(stat._id);
        if (!question) {
          question = await employeeQuestions.findById(stat._id);
        }
        return {
          questionId: stat._id,
          questionText: question?.contenido || "Pregunta no encontrada",
          avgScore: stat.avgScore,
          count: stat.count
        };
      })
    );

    return res.status(200).json(detailedStats);
  } catch (error) {
    console.error("Error obteniendo estadísticas por categoría:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

/**
 * GET /reviewers/:companyUserId
 * Obtener lista de usuarios que han calificado a la empresa
 */
router.get("/reviewers/:companyUserId", async (req: Request, res: Response) => {
  try {
    const { companyUserId } = req.params;
    const { search } = req.query; // Parámetro de búsqueda

    if (!mongoose.Types.ObjectId.isValid(companyUserId)) {
      return res.status(400).json({ message: "ID de empresa inválido" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    // Verificar token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Solo la empresa puede ver quiénes la han calificado
    if (decoded.userId !== companyUserId) {
      return res.status(403).json({ 
        message: "No tienes permiso para ver esta información" 
      });
    }

    const objectId = new mongoose.Types.ObjectId(companyUserId);

    // Obtener IDs únicos de usuarios que han respondido
    const responses = await ResponseModel.distinct("userId", { 
      companyUserId: objectId 
    });

    // Construir query de búsqueda
    let query: any = {
      _id: { $in: responses },
      role: { $in: ["employee", "candidate"] }
    };

    // Si hay búsqueda, agregar filtro de nombre
    if (search && typeof search === "string") {
      query.name = { $regex: search, $options: "i" };
    }

    // Obtener información de usuarios
    const reviewers = await User.find(query)
      .select("_id name email role")
      .sort({ name: 1 });

    // Para cada usuario, obtener fecha de última respuesta
    const reviewersWithDate = await Promise.all(
      reviewers.map(async (reviewer) => {
        const lastResponse = await ResponseModel.findOne({
          userId: reviewer._id,
          companyUserId: objectId
        }).sort({ createdAt: -1 });

        return {
          _id: reviewer._id,
          name: reviewer.name,
          email: reviewer.email,
          role: reviewer.role,
          lastReviewDate: lastResponse?.createdAt || null
        };
      })
    );

    return res.status(200).json(reviewersWithDate);
  } catch (error) {
    console.error("Error obteniendo revisores:", error);
    return res.status(500).json({ message: "Error al obtener revisores" });
  }
});

export default router;
