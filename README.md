# 🌿 Smart Home Gardening Assistant System

A full-stack web application that helps home gardeners manage plants efficiently using real-time weather data, AI-powered care recommendations, and plant health analysis.

---

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, React Router, Axios     |
| Backend    | Python FastAPI                    |
| Database   | MongoDB (via Motor async driver)  |
| Auth       | JWT (JSON Web Tokens)             |
| Weather    | OpenWeatherMap API                |

---

## 📁 Project Structure

```
garden-app/
├── frontend/               # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── utils/          # Axios instance, helpers
│   │   └── styles/         # Global CSS
│   └── package.json
├── backend/                # FastAPI application
│   ├── main.py
│   ├── routers/            # API route handlers
│   ├── models/             # Pydantic schemas
│   ├── services/           # Business logic
│   ├── config/             # DB & settings
│   └── requirements.txt
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js >= 18
- Python >= 3.10
- MongoDB (local or Atlas)
- OpenWeatherMap API key (free at https://openweathermap.org/api)

---

## 🔧 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API Docs (Swagger): http://localhost:8000/docs

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run the app
npm start
```

Frontend runs at: http://localhost:3000

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=garden_assistant
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
OPENWEATHER_API_KEY=your_openweathermap_api_key
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_OPENWEATHER_KEY=your_openweathermap_api_key
```

---

## 📦 MongoDB Collections

| Collection    | Purpose                          |
|---------------|----------------------------------|
| users         | User accounts and profiles       |
| plants        | Plant details per user           |
| notifications | Alerts and reminders             |
| weather_logs  | Cached weather snapshots         |

---

## 🌱 Seed Data

To insert sample data:
```bash
cd backend
python seed_data.py
```

---

## 🔑 Demo Credentials (after seeding)

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@garden.com    | Admin@123  |
| User  | john@garden.com     | User@123   |

---

## 🌐 API Endpoints

### Auth
- `POST /auth/register` – Register new user
- `POST /auth/login` – Login and get JWT token

### Users
- `GET /users/me` – Get current user profile
- `PUT /users/me` – Update profile

### Plants
- `GET /plants` – Get all plants (current user)
- `POST /plants` – Add new plant
- `PUT /plants/{id}` – Update plant
- `DELETE /plants/{id}` – Delete plant
- `POST /plants/{id}/water` – Log watering event

### Weather
- `GET /weather?city={city}` – Current weather
- `GET /weather/forecast?city={city}` – 5-day forecast

### Recommendations
- `GET /recommendations/{plant_id}` – Watering recommendation
- `GET /recommendations/all` – All plant recommendations

### Alerts
- `GET /alerts` – Get user notifications
- `PUT /alerts/{id}/read` – Mark as read

---

## 🚀 Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Frontend (Vercel / Netlify)
1. `npm run build`
2. Deploy `build/` folder to Vercel
3. Set `REACT_APP_API_URL` to production backend URL

---

## ✨ Features

- ✅ JWT Authentication (register, login, logout)
- ✅ Plant CRUD with image upload
- ✅ Real-time weather integration
- ✅ Smart watering recommendations
- ✅ Plant health analysis
- ✅ Dashboard with stats & charts
- ✅ Notifications & alerts
- ✅ Dark/light mode
- ✅ Mobile responsive
- ✅ Admin panel
- ✅ Search & filter plants
- ✅ AI gardening chatbot (Claude-powered)
