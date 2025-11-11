import { Router, Request, Response } from "express";
import User from "../models/user";

const router = Router();

/**
 * GET /sitemap.xml
 * Genera un sitemap que incluye rutas estáticas y páginas de empresas (role='company').
 * Las URLs apuntan al frontend (FRONTEND_BASE_URL) y usan updatedAt como lastmod.
 */
router.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || "https://example.com";

    // Rutas estáticas que queremos exponer
    const staticRoutes = [
      { path: "/", changefreq: "daily", priority: "1.0" },
      { path: "/login", changefreq: "monthly", priority: "0.5" },
      { path: "/register", changefreq: "monthly", priority: "0.5" },
      { path: "/recover-password", changefreq: "monthly", priority: "0.3" },
      { path: "/dashboard", changefreq: "weekly", priority: "0.8" },
      { path: "/profile", changefreq: "weekly", priority: "0.7" },
      { path: "/feedback-history", changefreq: "weekly", priority: "0.6" },
      { path: "/record", changefreq: "weekly", priority: "0.6" },
      { path: "/survey/candidate", changefreq: "monthly", priority: "0.5" },
      { path: "/survey/employee", changefreq: "monthly", priority: "0.5" }
    ];

    // Construir header del XML
    let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    xml += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

    const formatUrl = (loc: string, lastmod: string | null, changefreq: string, priority: string) => {
      return `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    };

    const today = new Date().toISOString().slice(0, 10);

    // Añadir rutas estáticas
    for (const r of staticRoutes) {
      const loc = `${FRONTEND_BASE.replace(/\/$/, "")}${r.path}`;
      xml += formatUrl(loc, today, r.changefreq, r.priority);
    }

    // Añadir rutas dinámicas para empresas (users con role 'company')
    const companies = await User.find({ role: "company" }).select("updatedAt").lean();

    for (const c of companies) {
      const id = (c as any)._id?.toString();
      if (!id) continue;
      const lastmod = (c as any).updatedAt ? new Date((c as any).updatedAt).toISOString().slice(0, 10) : today;
      const loc = `${FRONTEND_BASE.replace(/\/$/, "")}/company/${id}`;
      xml += formatUrl(loc, lastmod, "weekly", "0.6");
    }

    xml += "</urlset>\n";

    res.header("Content-Type", "application/xml");
    return res.send(xml);
  } catch (err) {
    console.error("Error generando sitemap dinámico:", err);
    return res.status(500).send("Error generando sitemap");
  }
});

export default router;
