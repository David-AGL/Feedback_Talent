"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const app_1 = __importDefault(require("./app"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const questionsRoutes_1 = __importDefault(require("./routes/questionsRoutes"));
const passwordReset_1 = __importDefault(require("./routes/passwordReset"));
const feedbackHistoryRoutes_1 = __importDefault(require("./routes/feedbackHistoryRoutes"));
const responseRoutes_1 = __importDefault(require("./routes/responseRoutes"));
const PORT = Number(process.env.PORT || 4000);
// CLIENT_ORIGIN can be a comma-separated list: e.g. "https://mi-front.onrender.com,http://localhost:5173"
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const origins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
// CORS / JSON
app_1.default.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, server-to-server) or if origin is in the allow list
        if (!origin || origins.includes(origin))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app_1.default.use(express_1.default.json());
// Conectar a la BD
(0, db_1.connectDB)();
// Health check
app_1.default.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));
// Rutas
app_1.default.use("/api/usuarios", userRoutes_1.default);
app_1.default.use("/api/preguntas", questionsRoutes_1.default);
app_1.default.use('/api/feedback-history', feedbackHistoryRoutes_1.default);
app_1.default.use("/auth", passwordReset_1.default);
app_1.default.use("/api/responses", responseRoutes_1.default);
// Arrancar servidor
app_1.default.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en 0.0.0.0:${PORT}`);
    console.log(`CORS permitido desde: ${origins.join(', ')}`);
});
//# sourceMappingURL=server.js.map