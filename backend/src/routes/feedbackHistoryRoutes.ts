// backend/src/routes/feedbackHistoryRoutes.ts
import express, { Request, Response } from "express";
import ResponseModel from "../models/response";
import candidateQuestions from "../models/candidateQuestions";
import employeeQuestions from "../models/employeeQuestions";
import { authenticateToken, restrictTo } from "../middlewares/auth";
import User from "../models/user";

const router = express.Router();

// ✅ RUTA DE PRUEBA (sin autenticación)
router.get("/test", (req: Request, res: Response) => {
  res.json({ 
    message: "✅ Rutas de feedback-history funcionando", 
    timestamp: new Date().toISOString() 
  });
});

// GET - Obtener todos los feedbacks del usuario autenticado
router.get("/my-feedbacks", authenticateToken, restrictTo("employee", "candidate"), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    console.log("🔍 Usuario solicitando feedbacks:", { userId, role });

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const responses = await ResponseModel.find({ userId, role })
      .sort({ createdAt: -1 })
      .lean();

    console.log("📊 Respuestas encontradas:", responses.length);

    const questionIds = [...new Set(responses.map((r: any) => r.questionId.toString()))];
    const questions = role === "employee" 
      ? await employeeQuestions.find({ _id: { $in: questionIds } }).lean()
      : await candidateQuestions.find({ _id: { $in: questionIds } }).lean();

    const questionMap = questions.reduce((acc: any, question: any) => {
      acc[question._id.toString()] = question;
      return acc;
    }, {});

    const companyIds = [...new Set(responses.map((r: any) => r.companyUserId.toString()))];
    const companies = await User.find({ _id: { $in: companyIds } }).lean();
    const companyMap = companies.reduce((acc: any, company: any) => {
      acc[company._id.toString()] = company;
      return acc;
    }, {});

    const enrichedResponses = responses.map((response: any) => {
      const company = companyMap[response.companyUserId.toString()];
      return {
        ...response,
        company: company 
          ? { _id: company._id, name: company.name, email: company.email }
          : { _id: response.companyUserId.toString(), name: "Empresa no encontrada", email: "" },
        question: questionMap[response.questionId.toString()] || { 
          contenido: "Pregunta no encontrada", 
          tipo: "text",
          categoria: response.categoria 
        },
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedResponses.length,
      data: enrichedResponses,
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ message: "Error al obtener feedbacks", error });
  }
});

// PUT - Actualizar
router.put("/:responseId", authenticateToken, restrictTo("employee", "candidate"), async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;
    const { answer } = req.body;
    const userId = req.user?.id;

    if (!answer) {
      return res.status(400).json({ message: "La respuesta es requerida" });
    }

    const response = await ResponseModel.findOne({ _id: responseId, userId });

    if (!response) {
      return res.status(404).json({ message: "Respuesta no encontrada" });
    }

    response.answer = answer;
    await response.save();

    res.status(200).json({
      success: true,
      message: "Respuesta actualizada exitosamente",
      data: response,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar", error });
  }
});

// DELETE - Eliminar
router.delete("/:responseId", authenticateToken, restrictTo("employee", "candidate"), async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;
    const userId = req.user?.id;

    const response = await ResponseModel.findOne({ _id: responseId, userId });

    if (!response) {
      return res.status(404).json({ message: "Respuesta no encontrada" });
    }

    await ResponseModel.deleteOne({ _id: responseId });

    res.status(200).json({
      success: true,
      message: "Respuesta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al eliminar", error });
  }
});

// DELETE - Eliminar todos los feedbacks de una empresa
router.delete("/company/:companyId", authenticateToken, restrictTo("employee", "candidate"), async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const userId = req.user?.id;

    const result = await ResponseModel.deleteMany({ companyUserId: companyId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No se encontraron feedbacks para esta empresa" });
    }

    res.status(200).json({
      success: true,
      message: `Se eliminaron ${result.deletedCount} feedbacks exitosamente`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al eliminar feedbacks por empresa", error });
  }
});

export default router;
