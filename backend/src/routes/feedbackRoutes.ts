import { Router } from "express";

const feedbackRoutes = Router();

// Ejemplo: Ruta para obtener feedback
feedbackRoutes.get("/", (req, res) => {
  res.json({ message: "Lista de feedback" });
});

// Ejemplo: Ruta para crear feedback (puedes expandir según necesites)
feedbackRoutes.post("/", (req, res) => {
  const { text } = req.body;
  res.json({ message: "Feedback creado", text });
});

export default feedbackRoutes;