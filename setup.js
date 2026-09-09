const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function run(command, cwd = ROOT) {
  console.log(`\n> ${command}`);
  execSync(command, {
    cwd,
    stdio: "inherit",
    shell: true,
  });
}

function writeIfMissing(file, content) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content);
    console.log(`Creado: ${file}`);
  }
}

console.log("\n======================================");
console.log("   ELETON DIGITAL GUEST - SETUP");
console.log("======================================\n");

// 1. Configuración local
console.log("1. Creando configuraciones...");

writeIfMissing(
  path.join(ROOT, "backend", ".env"),
  `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/recreacion_eleton?schema=public"
JWT_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
`
);

writeIfMissing(
  path.join(ROOT, "frontend", ".env"),
  `VITE_API_URL="http://localhost:4000/api"
`
);

// 2. Dependencias
console.log("\n2. Instalando dependencias del backend...");
run("npm install", path.join(ROOT, "backend"));

console.log("\n3. Instalando dependencias del frontend...");
run("npm install", path.join(ROOT, "frontend"));

// 3. Docker
console.log("\n4. Levantando PostgreSQL y backend con Docker...");
run("docker compose up -d --build");

// 4. Prisma dentro del contenedor
console.log("\n5. Generando Prisma Client...");
run("docker exec eleton-backend npx prisma generate");

console.log("\n6. Aplicando migraciones...");
run("docker exec eleton-backend npx prisma migrate deploy");

// 5. Final
console.log("\n======================================");
console.log("   SETUP COMPLETADO");
console.log("======================================\n");

console.log("PostgreSQL: Docker");
console.log("Backend:     http://localhost:4000");
console.log("Frontend:    http://localhost:5173");

console.log("\nPara iniciar la aplicación:");
console.log("npm run dev\n");