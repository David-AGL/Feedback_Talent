import mongoose from "mongoose";
import dotenv from "dotenv";
import Usuario from "./models/user.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Crear usuario de prueba
    const usuario = await Usuario.create({
      nombre: "Carlos",
      email: "carlos@example.com",
      contrasena: "segura123",
      rol: "empleado",
      descripcion: "Empleado de RRHH",
      fechaNacimiento: new Date("1990-03-12"),
      numeroIdentificacion: "1234567890"
    });

    console.log("🙌 Usuario creado:", usuario);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
  }
};

run();

// Para correr el archivo:
// node --loader ts-node/esm src/pruebas.ts
