# Recreación Eleton

Aplicación para huéspedes de un hotel: ver actividades recreativas, filtrarlas por categoría,
inscribirse y consultar sus inscripciones. Los recreadores y administradores pueden crear,
editar y cancelar actividades, y gestionar a los participantes.

## Estructura del proyecto

```
recreacion-eleton/
├── backend/     API REST (Node + Express + Prisma + PostgreSQL)
└── frontend/    App web (React + Vite + Tailwind CSS)
```

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 14+ corriendo localmente o en un contenedor Docker

Si no tenés Postgres instalado, la forma más rápida es con Docker:

```bash
docker run --name eleton-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=recreacion_eleton -p 5432:5432 -d postgres:16
```

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editá `.env` y poné tu cadena de conexión real, por ejemplo (si usaste el comando de Docker de arriba):

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/recreacion_eleton?schema=public"
JWT_SECRET="alguna-clave-larga-y-aleatoria"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
```

Generar el cliente de Prisma y crear las tablas:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Cargar datos de ejemplo (3 usuarios de prueba + 2 actividades):

```bash
npm run seed
```

Levantar el servidor en modo desarrollo (recarga automática con nodemon):

```bash
npm run dev
```

La API queda disponible en `http://localhost:4000/api`. Podés verificarla con:

```bash
curl http://localhost:4000/api/health
```

### Usuarios de prueba (password: `password123`)

| Email                     | Rol        |
|---------------------------|------------|
| admin@eleton.com          | ADMIN      |
| juan.perez@eleton.com     | RECREADOR  |
| huesped@demo.com          | HUESPED    |

### Endpoints principales

| Método | Ruta                                              | Quién                  | Descripción                        |
|--------|----------------------------------------------------|-------------------------|-------------------------------------|
| POST   | /api/auth/registro                                 | Público                 | Crear cuenta de huésped             |
| POST   | /api/auth/login                                    | Público                 | Iniciar sesión                      |
| GET    | /api/auth/yo                                       | Autenticado              | Datos del usuario logueado          |
| GET    | /api/actividades?categoria=KIDS                    | Autenticado              | Listar / filtrar actividades        |
| GET    | /api/actividades/:id                               | Autenticado              | Detalle de una actividad            |
| POST   | /api/actividades                                   | Recreador / Admin        | Crear actividad                     |
| PUT    | /api/actividades/:id                               | Recreador / Admin        | Editar actividad                    |
| POST   | /api/actividades/:id/cancelar                      | Recreador / Admin        | Cancelar actividad                  |
| DELETE | /api/actividades/:id                               | Admin                    | Eliminar actividad definitivamente  |
| GET    | /api/actividades/:id/participantes                 | Recreador / Admin        | Lista de inscriptos                 |
| PATCH  | /api/actividades/inscripciones/:id/asistencia       | Recreador / Admin        | Marcar asistencia                   |
| POST   | /api/inscripciones                                 | Autenticado              | Inscribirse a una actividad         |
| DELETE | /api/inscripciones/:actividadId                    | Autenticado              | Cancelar inscripción                |
| GET    | /api/inscripciones/mias                            | Autenticado              | Ver mis actividades                 |

## 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abrí `http://localhost:5173`. Iniciá sesión con cualquiera de los usuarios de prueba.

## Reglas de negocio implementadas

- Un huésped no puede inscribirse dos veces a la misma actividad.
- Si no hay cupos disponibles, la inscripción pasa automáticamente a lista de espera.
- Al inscribirse (con cupo disponible) el cupo disminuye; al cancelar, se incrementa.
- Al cancelar una inscripción confirmada, se promueve automáticamente al primero en lista de espera.
- Las actividades finalizadas o canceladas no aceptan nuevas inscripciones.
- Solo el recreador o administrador pueden crear, editar o cancelar actividades.
- Solo el administrador puede eliminar actividades definitivamente.

## Próximos pasos sugeridos

- Subida de imágenes reales (Cloudinary / S3) en vez del emoji placeholder.
- Panel de administración completo (gestión de usuarios y estadísticas).
- Notificaciones y recordatorios antes de que empiece una actividad.
- Despliegue: Vercel (frontend) + Render o Railway (backend + Postgres).
