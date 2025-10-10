// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db";
import app from "./app"; 
import userRoutes from "./routes/userRoutes";
import questionsRoutes from "./routes/questionsRoutes";
import passwordResetRouter from "./routes/passwordReset"; 

const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// CORS / JSON
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Conectar a la BD
connectDB();

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("API funcionando");
});


// Rutas
app.get("/", (_req, res) => res.send("API funcionando"));
app.use("/api/usuarios", userRoutes);
app.use("/api/preguntas", questionsRoutes);


app.use("/auth", passwordResetRouter);



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`CORS permitido desde: ${CLIENT_ORIGIN}`);
});
