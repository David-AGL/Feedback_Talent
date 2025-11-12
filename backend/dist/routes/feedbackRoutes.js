"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackRoutes = (0, express_1.Router)();
// Ejemplo: Ruta para obtener feedback
feedbackRoutes.get("/", (req, res) => {
    res.json({ message: "Lista de feedback" });
});
// Ejemplo: Ruta para crear feedback (puedes expandir según necesites)
feedbackRoutes.post("/", (req, res) => {
    const { text } = req.body;
    res.json({ message: "Feedback creado", text });
});
exports.default = feedbackRoutes;
//# sourceMappingURL=feedbackRoutes.js.map