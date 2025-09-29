import express from "express";
import cors from "cors";
import feedbackRoutes from "./routes/feedbackRoutes.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",  // Puerto default de Vite
  methods: ["GET", "POST", "PUT", "DELETE"],  // Métodos permitidos
  credentials: true  // Si usas cookies o auth
}));

app.use(express.json());

// Rutas
app.use("/api/feedback", feedbackRoutes);

export default app;
