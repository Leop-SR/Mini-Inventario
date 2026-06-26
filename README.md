# 📦 MiniInventario

Sistema de gestión de inventario con **Spring Boot** (backend en Render) y **Angular** (frontend en Netlify).

---

## 🗂 Estructura del proyecto

```
mini-inventario/
├── backend/          ← Spring Boot + Docker
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/         ← Angular 17 (standalone)
│   ├── src/
│   └── angular.json
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml
├── render.yaml
└── README.md
```

---

## 🚀 Despliegue paso a paso

### 1. Subir el repo a GitHub

```bash
git init
git add .
git commit -m "feat: initial mini-inventario project"
git remote add origin https://github.com/TU-USUARIO/mini-inventario.git
git push -u origin main
```

---

### 2. Crear la base de datos en Render

1. Entra a [render.com](https://render.com) → **New → PostgreSQL**
2. Configura:
   - **Name**: `mini-inventario-db`
   - **Plan**: Free
3. Anota los datos de conexión que te da Render:
   - **Internal Database URL** (para usar dentro de Render)
   - **Username**, **Password**, **Database Name**

---

### 3. Desplegar el backend en Render (Docker)

1. En Render → **New → Web Service**
2. Conecta tu repo de GitHub
3. Configura:
   - **Root Directory**: `backend`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile`
   - **Plan**: Free

4. En **Environment Variables**, agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `jdbc:postgresql://HOST:5432/DBNAME` ← usa la Internal URL de Render |
| `DATABASE_USERNAME` | El usuario de tu DB |
| `DATABASE_PASSWORD` | La contraseña de tu DB |
| `FRONTEND_URL` | `https://TU-USUARIO.github.io/mini-inventario` |
| `PORT` | `8080` |

> ⚠️ El formato de `DATABASE_URL` debe ser JDBC:
> `jdbc:postgresql://dpg-xxxx.render.com/inventario`
> (Render te da formato `postgres://`, cámbialo a `jdbc:postgresql://`)

5. Clic en **Deploy** y espera el build Docker (~5 min la primera vez).

6. Anota la URL del servicio: `https://mini-inventario-api.onrender.com`

---

### 4. Configurar el frontend para producción

Edita `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://mini-inventario-api.onrender.com/api'
};
```

Si tu repositorio se llama diferente a `mini-inventario`, actualiza también:

```json
// frontend/package.json
"build:gh-pages": "ng build --configuration production --base-href /TU-REPO-NAME/"
```

---


## 💻 Desarrollo local

### Backend
```bash
cd backend

# Crea un archivo .env o exporta variables:
export DATABASE_URL=jdbc:postgresql://localhost:5432/inventario
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=tu_password
export FRONTEND_URL=http://localhost:4200

./mvnw spring-boot:run
# API disponible en http://localhost:8080/api
```

### Frontend
```bash
cd frontend
npm install
npm start
# App disponible en http://localhost:4200
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos (paginado, filtros) |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |
| GET | `/api/products/dashboard` | Estadísticas |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |

### Parámetros de listado de productos
- `search` - búsqueda por nombre
- `category` - filtrar por categoría
- `page` - número de página (0-indexed)
- `size` - elementos por página
- `sortBy` - campo de ordenamiento
- `sortDir` - `asc` | `desc`

---

## 🐳 Docker local (opcional)

```bash
cd backend
docker build -t mini-inventario-api .
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/inventario \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=tu_password \
  -e FRONTEND_URL=http://localhost:4200 \
  mini-inventario-api
```

---

## ⚙️ Variables de entorno (resumen)

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ | JDBC URL de PostgreSQL |
| `DATABASE_USERNAME` | ✅ | Usuario de la BD |
| `DATABASE_PASSWORD` | ✅ | Contraseña de la BD |
| `FRONTEND_URL` | ✅ | URL del frontend (CORS) |
| `PORT` | ❌ | Puerto del servidor (default: 8080) |

---

## 🛠 Stack

- **Backend**: Java 17 · Spring Boot 3.2 · Spring Data JPA · PostgreSQL · Lombok
- **Frontend**: Angular 17 · Standalone Components · HttpClient
- **Deploy**: Render (Docker) · Netlify
