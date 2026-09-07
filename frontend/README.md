# Eleton Digital Guest

Aplicación web para huéspedes del hotel **Eleton Resort**, desarrollada para centralizar información, actividades y reservas de los diferentes servicios del hotel.

## Módulos

* 🏨 Información del hotel
* 📢 Avisos
* 🎭 Teatro
* 🧖 Spa
* 🍽️ Restó
* 🎯 Recreación

## Tecnologías

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express
* Prisma ORM
* JWT
* PostgreSQL

### Infraestructura

* Docker
* Docker Compose

## Requisitos

Antes de comenzar, instalar:

* Node.js
* Docker Desktop
* Git

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd eleton-digital-guest
```

### 1. Configurar variables de entorno

Crear el archivo `.env` a partir de `.env.example`.

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Revisar los valores del archivo `.env` antes de iniciar el proyecto.

## 2. Iniciar PostgreSQL

Desde la carpeta raíz del proyecto:

```powershell
docker compose up -d
```

Esto crea e inicia automáticamente el contenedor PostgreSQL utilizado por la aplicación.

## 3. Instalar dependencias del Backend

```powershell
cd backend
npm install
```

Generar Prisma Client:

```powershell
npx prisma generate
```

## 4. Base de datos

La aplicación utiliza PostgreSQL mediante Docker.

Para aplicar las migraciones:

```powershell
npx prisma migrate dev
```

Si se dispone de un backup de la base de datos, puede restaurarse utilizando `pg_restore`.

> Los archivos de backup y las variables de entorno personales no deben subirse al repositorio público.

## 5. Iniciar Backend

Desde `backend`:

```powershell
npm run dev
```

El backend estará disponible normalmente en:

```text
http://localhost:4000
```

## 6. Instalar dependencias del Frontend

Abrir otra terminal y ejecutar desde la carpeta raíz:

```powershell
cd frontend
npm install
```

## 7. Iniciar Frontend

```powershell
npm run dev
```

Vite mostrará la dirección local, normalmente:

```text
http://localhost:5173
```

## Estructura del proyecto

```text
eleton-digital-guest/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Base de datos

PostgreSQL se ejecuta mediante Docker Compose.

Configuración utilizada durante el desarrollo:

```text
Base de datos: recreacion_eleton
Usuario: postgres
Puerto: 5432
```

Cada integrante del equipo tendrá su propia instancia local de PostgreSQL mediante Docker.

## Desarrollo

Para trabajar con el proyecto:

1. Iniciar Docker Desktop.
2. Ejecutar `docker compose up -d`.
3. Iniciar el backend.
4. Iniciar el frontend.
5. Realizar los cambios necesarios.
6. Crear un commit.
7. Hacer push a la rama correspondiente.



Las variables necesarias para configurar el proyecto están documentadas en `.env.example`.

---

**Eleton Digital Guest**
Proyecto de desarrollo web — Eleton Resort
