// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config"; // Carga las variables de entorno desde .env

// Extiende la interfaz Request de Express para incluir la propiedad user
declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key"; // Clave desde .env con valor por defecto

// Middleware para autenticar el token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Extrae el token del header Authorization (formato: "Bearer <token>")
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No se proporcionó un token" });
  }

  // Verifica el token
  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido o expirado" });
    }

    // Almacena el usuario decodificado (id y role) en req.user
    req.user = { id: decoded.userId, role: decoded.role };
    next(); // Pasa al siguiente middleware o ruta
  });
};

// Middleware para restringir acceso por rol
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
};
