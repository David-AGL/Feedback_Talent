import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import questionsRoutes from "./routes/questionsRoutes"; // Importa las rutas de preguntas

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",  // Puerto default de Vite
  methods: ["GET", "POST", "PUT", "DELETE"],  // Métodos permitidos
  credentials: true  // Si usas cookies o auth
}));

app.use(express.json());

app.use("/api/auth", userRoutes); 
app.use("/api/preguntas", questionsRoutes); // Monta las rutas de preguntas

export default app;
