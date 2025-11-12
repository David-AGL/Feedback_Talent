import { Router, Request, Response } from "express";
import { verifyTransport } from "../services/mailer";

const router = Router();

// GET /api/debug/mail/verify
router.get("/mail/verify", async (req: Request, res: Response) => {
  try {
    const result = await verifyTransport();
    if (result.ok) return res.json({ ok: true, info: result.info || null });
    return res.status(502).json({ ok: false, error: result.error || "verify failed", info: result.info || null });
  } catch (err) {
    console.error("/api/debug/mail/verify error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
});

export default router;
