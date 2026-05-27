# 🌿 PlantAI

Aplicación web para identificar plantas, diagnosticar problemas con IA y conectar con una comunidad de amantes de las plantas.

## Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Python / Flask + SQLAlchemy
- **Base de datos**: PostgreSQL 15
- **IA**: Anthropic Claude Vision API
- **Autenticación**: JWT
- **Fotos**: Cloudinary

---

## Abrir en GitHub Codespace

1. Sube este proyecto a un repositorio de GitHub
2. Click en **Code → Codespaces → Create codespace on main**
3. Espera ~2 min mientras se configura automáticamente
4. El script `.devcontainer/setup.sh` instala todo solo

---

## Arrancar el proyecto

Abre **dos terminales** en el Codespace:

### Terminal 1 — Backend
```bash
cd backend
cp .env.example .env
# Edita .env y agrega tu ANTHROPIC_API_KEY
flask run
# Corre en http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
# Corre en http://localhost:5173
```

---

## Variables de entorno necesarias

Edita `backend/.env`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Ya configurada para Codespace |
| `JWT_SECRET_KEY` | Cambia por una clave segura |
| `ANTHROPIC_API_KEY` | Obtén en console.anthropic.com |
| `CLOUDINARY_*` | Obtén en cloudinary.com (gratis) |

---

## Estructura del proyecto

```
plantai/
├── .devcontainer/
│   ├── devcontainer.json     # Config del Codespace
│   └── setup.sh              # Setup automático
│
├── backend/
│   ├── app/
│   │   ├── __init__.py       # App factory Flask
│   │   ├── models/           # Modelos PostgreSQL
│   │   ├── routes/           # Endpoints API
│   │   │   ├── auth.py       # Login / registro / JWT
│   │   │   ├── plants.py     # CRUD de plantas
│   │   │   ├── doctor.py     # Modo Doctor IA
│   │   │   ├── community.py  # Feed comunidad
│   │   │   └── users.py      # Perfiles
│   │   └── services/
│   │       └── ai_service.py # Integración Anthropic
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Rutas principales
    │   ├── context/
    │   │   └── AuthContext.jsx  # JWT + estado global
    │   ├── services/
    │   │   └── api.js           # Cliente axios
    │   ├── components/          # Componentes reutilizables
    │   ├── pages/               # Pantallas
    │   └── hooks/               # Custom hooks
    ├── index.html
    └── vite.config.js
```

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login → devuelve JWT |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/plants/` | Mis plantas |
| POST | `/api/plants/` | Agregar planta |
| POST | `/api/doctor/analyze` | Modo Doctor (IA) |
| GET | `/api/community/feed` | Feed comunidad |
| POST | `/api/community/post` | Publicar en comunidad |

---

## Deploy

- **Frontend** → Vercel (conecta el repo, deploy automático)
- **Backend** → Render.com (web service, Python)
- **BD** → Neon.tech (PostgreSQL serverless, tier gratis)
