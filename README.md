# Eleton Digital Guest

Aplicación web para huéspedes del hotel Eleton.

El sistema permite a los huéspedes consultar y utilizar diferentes servicios del hotel desde una única aplicación web, sin necesidad de instalar software adicional.

Actualmente el proyecto incluye módulos de:

* Recreación
* Resto
* Spa
* Teatro
* Avisos
* Información y servicios del hotel

El proyecto está desarrollado con React, Node.js, Express, Prisma y PostgreSQL, utilizando Docker para simplificar la configuración del entorno de desarrollo.

---

## Estructura del proyecto

```text
eleton-digital-guest/

├── backend/              API REST (Node + Express + Prisma)
├── frontend/             Aplicación web (React + Vite + Tailwind CSS)
├── docker-compose.yml    PostgreSQL + Backend
├── setup.js              Configuración automática del proyecto
└── README.md
```

---

## Requisitos previos

Solamente es necesario tener instalado:

* Node.js 18 o superior
* Docker Desktop
* Git

**No es necesario instalar PostgreSQL localmente.**

PostgreSQL se ejecuta automáticamente mediante Docker.

---

# Instalación

Después de clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd eleton-digital-guest
```

Ejecutar:

```bash
npm run setup
```

El script de configuración realiza automáticamente:

1. Instalación de dependencias del backend.
2. Instalación de dependencias del frontend.
3. Creación de archivos `.env` cuando son necesarios.
4. Levantamiento de PostgreSQL mediante Docker.
5. Construcción del backend mediante Docker.
6. Generación de Prisma Client.
7. Aplicación de las migraciones de la base de datos.

Al finalizar debería aparecer:

```text
SETUP COMPLETADO
```

---

# Ejecutar la aplicación

Una vez realizado el setup:

```bash
npm run dev
```

Esto inicia:

* Backend: `http://localhost:4000`
* Frontend: `http://localhost:5173`

Abrir en el navegador:

```text
http://localhost:5173
```

---

# Base de datos

La base de datos utilizada es PostgreSQL 16.

PostgreSQL se ejecuta mediante Docker utilizando:

```text
Base de datos: recreacion_eleton
Usuario: postgres
Puerto: 5432
```

El contenedor se llama:

```text
eleton-db
```

El backend ejecutado dentro de Docker se conecta a PostgreSQL mediante el nombre del servicio:

```text
postgres:5432
```

De esta manera no es necesario instalar ni configurar PostgreSQL manualmente en cada computadora.

---

# Docker

Para levantar manualmente los servicios:

```bash
docker compose up -d --build
```

Para detener los servicios:

```bash
docker compose down
```

Los datos de PostgreSQL se almacenan en un volumen Docker:

```text
eleton_postgres_data
```

Esto permite conservar la información de la base de datos aunque los contenedores sean detenidos.

---

# Prisma

El proyecto utiliza Prisma como ORM.

Para generar Prisma Client:

```bash
docker exec eleton-backend npx prisma generate
```

Para aplicar las migraciones:

```bash
docker exec eleton-backend npx prisma migrate deploy
```

Las migraciones se encuentran en:

```text
backend/prisma/migrations
```

---

# Backend

El backend utiliza:

* Node.js
* Express
* Prisma
* PostgreSQL
* JWT
* Nodemon

La API está disponible en:

```text
http://localhost:4000/api
```

Endpoint de salud:

```text
GET /api/health
```

Ejemplo:

```bash
curl http://localhost:4000/api/health
```

Respuesta esperada:

```text
ok servicio
```

---

# Usuarios de prueba

Password de los usuarios de prueba:

```text
password123
```

| Email                                                 | Rol       |
| ----------------------------------------------------- | --------- |
| [admin@eleton.com](mailto:admin@eleton.com)           | ADMIN     |
| [juan.perez@eleton.com](mailto:juan.perez@eleton.com) | RECREADOR |
| [huesped@demo.com](mailto:huesped@demo.com)           | HUESPED   |

---

# Recreación

El módulo de Recreación permite consultar las actividades disponibles, filtrarlas por categoría, inscribirse y consultar las inscripciones.

Los recreadores y administradores pueden gestionar las actividades y consultar los participantes.

## Endpoints principales

| Método | Ruta                                            | Quién             | Descripción                  |
| ------ | ----------------------------------------------- | ----------------- | ---------------------------- |
| POST   | `/api/auth/registro`                            | Público           | Crear cuenta de huésped      |
| POST   | `/api/auth/login`                               | Público           | Iniciar sesión               |
| GET    | `/api/auth/yo`                                  | Autenticado       | Datos del usuario logueado   |
| GET    | `/api/actividades?categoria=KIDS`               | Autenticado       | Listar / filtrar actividades |
| GET    | `/api/actividades/:id`                          | Autenticado       | Detalle de una actividad     |
| POST   | `/api/actividades`                              | Recreador / Admin | Crear actividad              |
| PUT    | `/api/actividades/:id`                          | Recreador / Admin | Editar actividad             |
| POST   | `/api/actividades/:id/cancelar`                 | Recreador / Admin | Cancelar actividad           |
| DELETE | `/api/actividades/:id`                          | Admin             | Eliminar actividad           |
| GET    | `/api/actividades/:id/participantes`            | Recreador / Admin | Lista de inscriptos          |
| PATCH  | `/api/actividades/inscripciones/:id/asistencia` | Recreador / Admin | Marcar asistencia            |
| POST   | `/api/inscripciones`                            | Autenticado       | Inscribirse a una actividad  |
| DELETE | `/api/inscripciones/:actividadId`               | Autenticado       | Cancelar inscripción         |
| GET    | `/api/inscripciones/mias`                       | Autenticado       | Ver mis actividades          |

---

# Reglas de negocio de Recreación

* Un huésped no puede inscribirse dos veces a la misma actividad.
* Si no hay cupos disponibles, la inscripción pasa automáticamente a lista de espera.
* Al confirmar una inscripción, el cupo disponible disminuye.
* Al cancelar una inscripción, el cupo se libera.
* Al cancelarse una inscripción confirmada, se promueve automáticamente al primero de la lista de espera.
* Las actividades finalizadas o canceladas no aceptan nuevas inscripciones.
* Solo recreadores y administradores pueden crear, editar o cancelar actividades.
* Solo administradores pueden eliminar actividades definitivamente.

---

# Resto

El módulo de Resto permite consultar los servicios gastronómicos disponibles y realizar reservas.

Incluye servicios como:

* Desayuno
* Almuerzo
* Merienda
* Cena

Las reservas pueden asociarse a diferentes ubicaciones del hotel según la configuración y capacidad disponible.

---

# Spa

El módulo de Spa permite gestionar reservas para los servicios del spa, incluyendo el circuito hídrico.

El sistema contempla:

* Turnos de duración definida.
* Control de capacidad.
* Horarios de funcionamiento.
* Restricciones horarias para menores.
* Diferencias entre temporada alta y temporada normal.

---

# Teatro

El módulo de Teatro permite consultar las funciones disponibles y gestionar las reservas correspondientes.

El sistema contempla la posibilidad de disponer de más de una función en determinados días de temporada alta.

---

# Avisos

El módulo de Avisos permite mostrar información y comunicaciones relevantes para los huéspedes dentro de la aplicación.

---

# Frontend

El frontend está desarrollado utilizando:

* React
* Vite
* Tailwind CSS

Para iniciar solamente el frontend durante el desarrollo:

```bash
cd frontend
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

---

# Flujo recomendado para nuevos integrantes

Después de clonar el repositorio:

```bash
npm run setup
```

Una vez finalizado:

```bash
npm run dev
```

No es necesario instalar PostgreSQL ni configurar manualmente las migraciones.

---

# Desarrollo

El proyecto utiliza Docker para PostgreSQL y el backend.

La arquitectura de desarrollo es:

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   React + Vite      │
                    │   localhost:5173    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │ Node + Express      │
                    │   localhost:4000    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │      Docker         │
                    │    postgres:5432    │
                    └─────────────────────┘
```

---

# Próximos pasos

* Completar los paneles administrativos de los diferentes módulos.
* Centralizar la gestión de reservas.
* Mejorar la gestión de usuarios y permisos.
* Incorporar notificaciones y recordatorios.
* Subir imágenes reales mediante almacenamiento externo.
* Preparar el despliegue de producción.
* Evaluar una versión instalable para administración del hotel.
