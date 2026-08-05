require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in environment variables for Prisma to connect to PostgreSQL.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Evita crear múltiples instancias de PrismaClient durante hot-reload en desarrollo
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
