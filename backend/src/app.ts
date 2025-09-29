import express from "express";
import cors from "cors";
import feedbackRoutes from "./routes/feedbackRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/feedback", feedbackRoutes);

export default app;
