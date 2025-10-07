import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",  // Puerto default de Vite
  methods: ["GET", "POST", "PUT", "DELETE"],  // Métodos permitidos
  credentials: true  // Si usas cookies o auth
}));

app.use(express.json());

app.use("/api/auth", userRoutes); 

export default app;
