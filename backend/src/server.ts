
import express from "express";
import { connectDB } from "./config/db.js"; // Importa la conexión a Mongo
import app from "./app.js";
import userRoutes from "./routes/userRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js"

//const app = express();
const PORT = process.env.PORT || 4000;

// Conectar BD
connectDB();

// Middleware
app.use(express.json());

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Monta las rutas en la app
app.use("/api/usuarios", userRoutes);  // Monta rutas de usuarios bajo /api/usuarios
app.use("/api/preguntas", questionsRoutes);  // Monta rutas de preguntas bajo /api/preguntas

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
