# 🌿 PlantAI

PlantAI is a full stack web app for plant lovers. Take a photo of a plant and AI identifies it, checks its health, and tells you how to take care of it. You can keep track of your own garden and share your plants with a community.

I designed and built this project on my own, from the database to the user interface.

## Features

- **Plant identification**: upload a photo and Claude AI identifies the plant and its scientific name
- **Doctor Mode**: AI analyzes a photo of your plant, finds health problems, and suggests treatment, using your location for more accurate advice
- **My Garden**: add, edit, and delete your plants, and see each plant's diagnosis history
- **Care log**: record watering and other care for each plant
- **Community feed**: share posts about your plants and like other users' posts
- **User profiles**: public profiles with each user's plants
- **Free and Pro plans**: free users get 2 AI scans per day, Pro users get unlimited scans
- **Secure accounts**: register and log in with JWT, with private pages protected on the frontend and backend

## Tech Stack

**Frontend:** React 18, Vite, React Router, Axios, CSS3
**Backend:** Python, Flask, SQLAlchemy, Flask-Migrate, Flask-CORS
**Database:** PostgreSQL
**Auth:** JWT (Flask-JWT-Extended)
**AI:** Anthropic Claude API with vision (image analysis)
**Deployment:** Render

## How It Works

1. The user logs in and the Flask backend returns a JWT token.
2. The frontend saves the token in a global store (built with `useReducer`) and in `sessionStorage`, so the session stays active after a page refresh.
3. An Axios interceptor adds the token to every request automatically, and logs the user out if the token expires.
4. When the user uploads a plant photo, the image is compressed in the browser and sent to the backend.
5. The backend sends the photo to Claude AI, which returns the plant's name, health status, and care tips as structured data.
6. The result is saved in PostgreSQL and linked to the user's plant, so they can see its history over time.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and get a JWT token |
| GET | `/api/auth/me` | Get the logged-in user |
| GET / POST | `/api/plants` | Get or add plants |
| GET / PUT / DELETE | `/api/plants/<id>` | Get, update, or delete a plant |
| GET / POST | `/api/plants/<id>/care` | Get or add care logs |
| POST | `/api/doctor/analyze` | Analyze a plant photo with AI |
| GET | `/api/doctor/remaining` | Scans left today (free plan) |
| GET | `/api/doctor/history/<plant_id>` | Diagnosis history for a plant |
| GET | `/api/community/feed` | Community posts |
| POST | `/api/community/post` | Create a post |
| POST | `/api/community/post/<id>/like` | Like a post |
| GET | `/api/users/<username>` | Public user profile |
| PUT | `/api/users/profile` | Update your profile |

## Project Structure

```
PlantAI/
├── backend/
│   ├── app/
│   │   ├── __init__.py    # Flask app factory
│   │   ├── models.py      # User, Plant, Diagnosis, CareLog, CommunityPost
│   │   ├── routes.py      # API endpoints
│   │   └── services.py    # Claude AI integration
│   ├── requirements.txt
│   └── run.py
│
└── frontend/
    └── src/
        ├── store.js       # Global state (useReducer)
        ├── hooks/         # useGlobalReducer
        ├── services/      # Axios client with JWT interceptor
        ├── components/    # Modals, layout, PrivateRoute
        ├── pages/         # Home, MyGarden, PlantDetail, DoctorMode, Community, Profile
        └── utils/         # Image compression helper
```

## Run It Locally

You need Python 3.10+, Node 20+, and PostgreSQL.

**Backend**
```bash
cd backend
cp .env.example .env
# Add your DATABASE_URL, JWT_SECRET_KEY, and ANTHROPIC_API_KEY to .env
pip install -r requirements.txt
python run.py
# Runs on http://localhost:5000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Author

**Juan Fernando Ayala**, Full Stack Developer
GitHub: [@juanfer21](https://github.com/juanfer21)
