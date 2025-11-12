"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const questionsRoutes_1 = __importDefault(require("./routes/questionsRoutes")); // Importa las rutas de preguntas
const passwordReset_1 = __importDefault(require("./routes/passwordReset"));
const responseRoutes_1 = __importDefault(require("./routes/responseRoutes"));
const companyProfileRoutes_1 = __importDefault(require("./routes/companyProfileRoutes"));
const userProfileRoutes_1 = __importDefault(require("./routes/userProfileRoutes"));
const sitemapRoutes_1 = __importDefault(require("./routes/sitemapRoutes"));
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Puertos de Vite
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    credentials: true
}));
app.use(express_1.default.json());
app.use("/api/auth", userRoutes_1.default);
app.use("/api/preguntas", questionsRoutes_1.default); // Monta las rutas de preguntas
app.use("/api/auth", passwordReset_1.default); // Rutas de reseteo de contraseña
app.use("/api/responses", responseRoutes_1.default);
app.use("/api/company", companyProfileRoutes_1.default);
app.use("/api/users", userProfileRoutes_1.default);
// Sitemap dinámico en la raíz: /sitemap.xml
app.use(sitemapRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map