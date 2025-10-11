import { Router } from "express";
import { createFeedback, updateFeedback, getFeedbackById, getFeedbackByUserId, getAllFeedback } from "../controller/feedback.controller";

const feedbackRoutes = Router();

// Ejemplo: Ruta para obtener feedback
feedbackRoutes.get("/", getAllFeedback);

// Ejemplo: Ruta para crear feedback (puedes expandir según necesites)
feedbackRoutes.post("/", createFeedback);

export default feedbackRoutes;
