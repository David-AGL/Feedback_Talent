
import express from "express";
import { connectDB } from "./config/db.js";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Conectar BD
connectDB();

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});