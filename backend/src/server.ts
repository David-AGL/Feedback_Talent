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

// Log configured origins for easier debugging in production
console.log('Configured CLIENT_ORIGIN:', rawOrigins);
console.log('Parsed allowed origins:', origins);

// CORS / JSON
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Log every origin that arrives so we can debug mismatches
    console.log('CORS check: incoming Origin header =', origin);
    // Allow requests with no origin (e.g. curl, server-to-server) or if origin is in the allow list
    if (!origin || origins.includes(origin)) {
      console.log('CORS allowed for origin:', origin);
      return callback(null, true);
    }
    console.log('CORS denied for origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

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
