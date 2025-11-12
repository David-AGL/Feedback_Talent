import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import questionsRoutes from "./routes/questionsRoutes"; // Importa las rutas de preguntas
import passwordResetRouter from "./routes/passwordReset";
import responseRoutes from "./routes/responseRoutes";
import companyProfileRoutes from "./routes/companyProfileRoutes";
import userProfileRoutes from "./routes/userProfileRoutes";
import sitemapRoutes from "./routes/sitemapRoutes";
import debugRoutes from "./routes/debugRoutes";

const app = express();

// Configure CORS using CLIENT_ORIGIN env so this runs before routes are mounted
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const origins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
console.log('Configured CLIENT_ORIGIN (app):', rawOrigins);
console.log('Parsed allowed origins (app):', origins);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log('CORS (app) check: incoming Origin header =', origin);
    if (!origin || origins.includes(origin)) {
      console.log('CORS (app) allowed for origin:', origin);
      return callback(null, true);
    }
    console.log('CORS (app) denied for origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", userRoutes); 
app.use("/api/preguntas", questionsRoutes); // Monta las rutas de preguntas
app.use("/api/auth", passwordResetRouter); // Rutas de reseteo de contraseña
app.use("/api/responses", responseRoutes);
app.use("/api/company", companyProfileRoutes); 
app.use("/api/users", userProfileRoutes);
// Sitemap dinámico en la raíz: /sitemap.xml
app.use(sitemapRoutes);
// Rutas de depuración (útiles para validar integraciones en producción)
app.use("/api/debug", debugRoutes);

export default app;
