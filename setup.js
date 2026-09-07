const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(command, cwd = process.cwd()) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: "inherit", shell: true });
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

console.log("1. Levantando PostgreSQL con Docker...");
run("docker compose up -d");

console.log("\n2. Instalando dependencias del backend...");
run("npm install", path.join(process.cwd(), "backend"));

console.log("\n3. Instalando dependencias del frontend...");
run("npm install", path.join(process.cwd(), "frontend"));

console.log("\n4. Creando configuracion del backend...");
writeIfMissing(
  path.join(process.cwd(), "backend", ".env"),
  `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/recreacion_eleton?schema=public"
JWT_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
`
);

console.log("\n5. Creando configuracion del frontend...");
writeIfMissing(
  path.join(process.cwd(), "frontend", ".env"),
  `VITE_API_URL="http://localhost:4000/api"
`
);

console.log("\n6. Generando Prisma Client...");
run("npm run prisma:generate", path.join(process.cwd(), "backend"));

console.log("\n7. Verificando migraciones...");
run("npx prisma migrate deploy", path.join(process.cwd(), "backend"));

console.log("\n======================================");
console.log("   SETUP COMPLETADO");
console.log("======================================");
console.log("\nAhora ejecuta:");
console.log("npm run dev\n");
