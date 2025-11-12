// src/server.ts
import "dotenv/config";
import express from "express";

import { connectDB } from "./config/db";
import app from "./app"; 
import userRoutes from "./routes/userRoutes";
import questionsRoutes from "./routes/questionsRoutes";
import passwordResetRouter from "./routes/passwordReset"; 
import feedbackHistoryRoutes from './routes/feedbackHistoryRoutes';
import responsesRoutes from "./routes/responseRoutes";

const PORT = Number(process.env.PORT || 4000);

app.use(express.json());

// Conectar a la BD
connectDB();

// Health check
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

// Rutas
app.use("/api/usuarios", userRoutes);
app.use("/api/preguntas", questionsRoutes);
app.use('/api/feedback-history', feedbackHistoryRoutes);
app.use("/auth", passwordResetRouter);
app.use("/api/responses", responsesRoutes);

// Arrancar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en 0.0.0.0:${PORT}`);
});
