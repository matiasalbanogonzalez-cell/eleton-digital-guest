require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const actividadRoutes = require("./routes/actividadRoutes");
const inscripcionRoutes = require("./routes/inscripcionRoutes");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true, servicio: "Recreación Eleton API" }));

app.use("/api/auth", authRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/inscripciones", inscripcionRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada." }));

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Recreación Eleton API corriendo en http://localhost:${PORT}`);
});
