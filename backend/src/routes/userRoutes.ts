// backend/src/routes/userRoutes.ts
import express, { Request, Response } from "express";
import User from "../models/user"; // ojo: minúsculas según árbol
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * POST /register
 * Crea un usuario. Campos esperados (EN INGLÉS):
 *  - idNumber, name, email, password, role, [birthDate?, description?]
 *  - birthDate es requerido para employee|candidate; opcional para company.
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      idNumber,
      name,
      email,
      password,
      birthDate,
      role,
      description,
    } = req.body as {
      idNumber?: string;
      name?: string;
      email?: string;
      password?: string;
      birthDate?: string | Date;
      role?: "employee" | "candidate" | "company";
      description?: string;
    };

    // Validaciones básicas
    if (!idNumber || !name || !email || !password || !role) {
      return res.status(400).json({
        message:
          "Faltan campos obligatorios: idNumber, name, email, password, role",
      });
    }
    if (!["employee", "candidate", "company"].includes(role)) {
      return res.status(400).json({ message: "role inválido" });
    }
    const isPerson = role === "employee" || role === "candidate";
    if (isPerson && !birthDate) {
      return res
        .status(400)
        .json({ message: "birthDate es obligatorio para personas" });
    }

    // Normalizaciones
    const normalizedEmail = String(email).trim().toLowerCase();

    const payload: any = {
      idNumber,
      name,
      email: normalizedEmail,
      password, // el hook de tu modelo la hashea a passwordHash
      role,
      description: description ?? undefined,
    };

    if (birthDate) {
      payload.birthDate =
        birthDate instanceof Date ? birthDate : new Date(birthDate);
      if (isNaN(payload.birthDate.getTime())) {
        return res.status(400).json({ message: "birthDate inválido" });
      }
    }

    const user = new User(payload);
    const saved = await user.save();

    return res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", user: saved });
  } catch (error: any) {
    // Índices únicos (email / idNumber)
    if (error?.code === 11000) {
      const key = Object.keys(error?.keyPattern ?? {})[0];
      let message = "Registro duplicado";
      if (key === "email") message = "Email ya registrado";
      if (key === "idNumber") message = "Número de identificación ya registrado";
      return res.status(409).json({ message });
    }
    if (error?.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Payload inválido", details: error.errors });
    }
    console.error("Error al registrar:", error);
    return res
      .status(500)
      .json({ message: "Error desconocido al registrar usuario" });
  }
});

/**
 * POST /login
 * Autentica por email + password.
 * Body: { email: string, password: string }
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Faltan email y/o password" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // passwordHash tiene select:false en el esquema; hay que incluirlo explícitamente
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // ← GENERAR JWT TOKEN
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
    
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role, // ← IMPORTANTE: incluir el rol
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Token válido por 7 días
    );

    // Al convertir a JSON, tu esquema oculta passwordHash (toJSON ya lo borra)
    const safeUser = user.toJSON();
    // Devolver token y usuario
    return res.status(200).json({ message: "Login exitoso", user: safeUser, token });
  } catch (error) {
    console.error("Error en login:", error);
    return res
      .status(500)
      .json({ message: "Error desconocido al iniciar sesión" });
  }
});

/**
 * GET /companies/search?q=nombre
 * Buscar usuarios con rol "company"
 */
router.get("/companies/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: "La búsqueda debe tener al menos 2 caracteres" 
      });
    }

    const companies = await User.find({
      role: "company",
      name: { $regex: query, $options: "i" },
    })
      .select("_id name email description idNumber")
      .limit(10)
      .sort({ name: 1 });

    return res.status(200).json(companies);
  } catch (error) {
    console.error("Error buscando empresas:", error);
    return res.status(500).json({ 
      message: "Error al buscar empresas" 
    });
  }
});

/**
 * GET /companies
 * Obtener todos los usuarios con rol "company"
 */
router.get("/companies", async (req: Request, res: Response) => {
  try {
    const companies = await User.find({ role: "company" })
      .select("_id name email description idNumber")
      .sort({ name: 1 });

    return res.status(200).json(companies);
  } catch (error) {
    console.error("Error obteniendo empresas:", error);
    return res.status(500).json({ 
      message: "Error al obtener empresas" 
    });
  }
});

export default router;
