import { connectDB } from "./config/db.js";
import app from "./app.js";
import userRoutes from "./routes/userRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";

const PORT = process.env.PORT || 4000;

// Conectar a la BD
connectDB();

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Montar rutas
app.use("/api/usuarios", userRoutes);
app.use("/api/preguntas", questionsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
