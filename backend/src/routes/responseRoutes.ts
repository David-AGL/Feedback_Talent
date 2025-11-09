import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import ResponseModel from "../models/response";
import candidateQuestions from "../models/candidateQuestions";
import employeeQuestions from "../models/employeeQuestions";

const router = express.Router();

/**
 * POST /submit
 * Enviar respuestas de encuesta
 */
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const { token, companyUserId, respuestas } = req.body;

    if (!token || !companyUserId || !respuestas) {
      return res.status(400).json({ 
        message: "Token, companyUserId y respuestas son requeridos" 
      });
    }

    // Decodificar token
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        message: "Token inválido o expirado" 
      });
    }

    const userId = decoded.userId;
    const role = decoded.role;

    if (!["employee", "candidate"].includes(role)) {
      return res.status(403).json({ 
        message: "Solo empleados y candidatos pueden responder encuestas" 
      });
    }

    // Determinar qué modelo de preguntas usar
    const QuestionModel = role === "employee" ? employeeQuestions : candidateQuestions;

    const savedResponses = [];
    const errors = [];

    for (const [questionId, answer] of Object.entries(respuestas)) {
      try {
        // Obtener la pregunta para su categoría
        const question = await QuestionModel.findById(questionId);
        
        if (!question) {
          errors.push({ questionId, error: "Pregunta no encontrada" });
          continue;
        }

        // Actualizar o crear respuesta
        const response = await ResponseModel.findOneAndUpdate(
          {
            userId,
            companyUserId,
            questionId,
          },
          {
            userId,
            companyUserId,
            questionId,
            answer,
            role,
            categoria: question.categoria,
          },
          {
            upsert: true,
            new: true,
          }
        );
        savedResponses.push(response);
      } catch (err: any) {
        console.error(`Error guardando respuesta para pregunta ${questionId}:`, err);
        errors.push({ questionId, error: err.message });
      }
    }

    if (errors.length > 0 && savedResponses.length === 0) {
      return res.status(400).json({ 
        message: "No se pudo guardar ninguna respuesta",
        errors,
      });
    }

    return res.status(200).json({ 
      message: errors.length > 0 
        ? "Encuesta enviada con algunos errores" 
        : "Encuesta enviada exitosamente",
      savedResponses,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error enviando encuesta:", error);
    return res.status(500).json({ 
      message: "Error al enviar encuesta" 
    });
  }
});

/**
 * GET /user/:userId/company/:companyUserId
 * Obtener respuestas de un usuario para una empresa
 */
router.get("/user/:userId/company/:companyUserId", async (req: Request, res: Response) => {
  try {
    const { userId, companyUserId } = req.params;

    const responses = await ResponseModel.find({ userId, companyUserId })
      .sort({ createdAt: -1 });

    return res.status(200).json(responses);
  } catch (error) {
    console.error("Error obteniendo respuestas:", error);
    return res.status(500).json({ 
      message: "Error al obtener respuestas" 
    });
  }
});

/**
 * GET /company/:companyUserId/summary
 * Obtener resumen de respuestas por empresa
 */
router.get("/company/:companyUserId/summary", async (req: Request, res: Response) => {
  try {
    const { companyUserId } = req.params;
    const mongoose = await import("mongoose");

    const summary = await ResponseModel.aggregate([
      { 
        $match: { 
          companyUserId: new mongoose.Types.ObjectId(companyUserId) 
        } 
      },
      {
        $group: {
          _id: {
            categoria: "$categoria",
            role: "$role"
          },
          count: { $sum: 1 },
          avgNumeric: { 
            $avg: { 
              $cond: [
                { $isNumber: "$answer" },
                "$answer",
                null
              ]
            }
          }
        }
      },
      { $sort: { "_id.categoria": 1, "_id.role": 1 } }
    ]);

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error obteniendo resumen:", error);
    return res.status(500).json({ 
      message: "Error al obtener resumen" 
    });
  }
});



router.get("/company/:companyUserId", async (req: Request, res: Response) => {
  try {
    const { companyUserId } = req.params;
    const responses = await ResponseModel.find({ companyUserId })
    return res.status(200).json(responses);
  }
  catch (error) {
    console.error("Error obteniendo respuestas:", error);
    return res.status(500).json({ message: "Error al obtener respuestas" });
  }

});

router.get("/top-companies", async (req: Request, res: Response) => {
  try {
    const mongoose = await import("mongoose");

    const topCompanies = await ResponseModel.aggregate([
      // Filtramos solo respuestas con valor numérico
      {
        $match: {
          $expr: { $isNumber: "$answer" }
        }
      },
      //  Agrupamos por empresa
      {
        $group: {
          _id: "$companyUserId",
          avgRating: { $avg: "$answer" },
          totalFeedbacks: { $sum: 1 }
        }
      },
      // Ordenamos y limitamos a las 3 mejores
      { $sort: { avgRating: -1 } },
      { $limit: 3 },
      // Unimos con la colección "users" usando companyUserId
      {
        $lookup: {
          from: "users",
          localField: "_id",          // companyUserId en responses
          foreignField: "_id",        // _id en users
          as: "companyInfo"
        }
      },
      // Proyectamos los datos finales
      {
        $project: {
          _id: 1,
          avgRating: { $round: ["$avgRating", 2] },
          totalFeedbacks: 1,
          companyName: { $arrayElemAt: ["$companyInfo.name", 0] },
          companyEmail: { $arrayElemAt: ["$companyInfo.email", 0] },
          companyRole: { $arrayElemAt: ["$companyInfo.role", 0] }
        }
      }
    ]);

    console.log("Top Companies:", topCompanies);
    res.status(200).json(topCompanies);
  } catch (error) {
    console.error(" Error obteniendo empresas mejor calificadas:", error);
    res.status(500).json({ message: "Error al obtener las empresas mejor calificadas" });
  }
});


router.get("/company/:companyUserId/reviewers", async (req: Request, res: Response) => {
  try {
    const { companyUserId } = req.params;
    const mongoose = await import("mongoose");

    const reviewers = await ResponseModel.aggregate([
      {
        $match: {
          companyUserId: new mongoose.Types.ObjectId(companyUserId)
        }
      },
      {
        $group: {
          _id: "$userId",
          lastReviewDate: { $max: "$updatedAt" },
          roles: { $addToSet: "$role" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $project: {
          _id: 1,
          lastReviewDate: 1,
          role: { $arrayElemAt: ["$roles", 0] },
          name: { $arrayElemAt: ["$userInfo.name", 0] },
          email: { $arrayElemAt: ["$userInfo.email", 0] }
        }
      },
      { $sort: { lastReviewDate: -1 } }
    ]);

    res.status(200).json(reviewers);
  } catch (error) {
    console.error("Error obteniendo revisores:", error);
    res.status(500).json({ message: "Error al obtener revisores" });
  }
});

export default router;