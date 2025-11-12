// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db";
import app from "./app"; 
import userRoutes from "./routes/userRoutes";
import questionsRoutes from "./routes/questionsRoutes";
import passwordResetRouter from "./routes/passwordReset"; 
import feedbackHistoryRoutes from './routes/feedbackHistoryRoutes';
import responsesRoutes from "./routes/responseRoutes";

const PORT = Number(process.env.PORT || 4000);

// CLIENT_ORIGIN can be a comma-separated list: e.g. "https://mi-front.onrender.com,http://localhost:5173"
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const origins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);

// CORS / JSON
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server) or if origin is in the allow list
      if (!origin || origins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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
  console.log(`CORS permitido desde: ${origins.join(', ')}`);
});
