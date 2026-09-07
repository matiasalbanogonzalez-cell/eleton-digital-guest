require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const actividadRoutes = require("./routes/actividadRoutes");
const inscripcionRoutes = require("./routes/inscripcionRoutes");
const restoRoutes = require("./routes/restoRoutes");
const spaRoutes = require("./routes/spaRoutes");
const teatroRoutes = require("./routes/teatroRoutes");
const avisoRoutes = require("./routes/avisoRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
  origin: /^http:\/\/localhost:\d+$/ ,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true, servicio: "Recreación Eleton API" }));

app.use("/api/auth", authRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
app.use("/api/resto", restoRoutes);
app.use("/api/spa", spaRoutes);
app.use("/api/teatro", teatroRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/admin", adminRoutes);

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
