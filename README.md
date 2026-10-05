# RAAHIX — AI-Powered Travel Planner

> **Apni Raah, Apna Safar.**

## Project Description

RAAHIX is an AI-powered travel planning web application designed to help users create personalized and practical travel plans based on their destination, duration, budget, interests, and travel preferences. The platform combines AI-generated itineraries with real-time place discovery, weather information, budget planning, saved places, and an AI travel assistant. It integrates external APIs with a FastAPI backend and PostgreSQL database to provide a scalable full-stack travel planning experience. The project was developed to demonstrate practical implementation of AI, backend APIs, database management, authentication, and cloud deployment.

---

## Project Goal

The primary goal of RAAHIX is to simplify travel planning by bringing itinerary generation, destination discovery, budget planning, and travel assistance into a single platform.

The project focuses on:

* Generating personalized AI-based travel itineraries
* Helping users discover relevant places and destinations
* Supporting budget-conscious trip planning
* Providing an interactive AI travel assistant
* Demonstrating full-stack development with AI and third-party APIs

---

## Demo & Live Deployment

### Demo Video

The **demo video is the preferred way to explore the project**, as the current Railway deployment is hosted under a limited/free trial environment and may become unavailable after the trial period ends.

**Demo Video:**
(https://drive.google.com/file/d/1Hit4yGz5O5Kb6PiHOplO_5_UQT_PEye9/view?usp=sharing)

### Live Application

raahix-production.up.railway.app

> **Note:** The live application is currently deployed on Railway under a limited trial environment. The live URL may become unavailable after the trial period ends. For long-term access, please refer to the demo video.

---

## Features

* **AI Trip Planning** — Generate personalized day-wise itineraries using Google Gemini.
* **Destination Discovery** — Search and explore places based on city and location.
* **Budget Planning** — Plan and visualize estimated trip expenses.
* **AI Travel Assistant** — Ask travel-related questions and refine trip plans.
* **Saved Places** — Save and manage places for future trips.
* **Weather Information** — Access destination weather information.
* **Authentication** — Secure registration, login, and protected user-specific APIs.
* **Interactive Dashboard** — View trip information and budget insights.
* **REST APIs** — Modular FastAPI backend for frontend and external service integration.
* **Cloud Database** — PostgreSQL database for production deployment.

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Chart.js

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication

### Database

* PostgreSQL
* SQLite for local development

### AI & APIs

* Google Gemini API
* Geoapify Places API
* Weather API
* Maps / Location APIs

### Deployment

* Railway

---

## Project Architecture

```text
                         RAAHIX
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Frontend Application          User Interaction
      HTML / CSS / JavaScript             │
             │                            │
             └─────────────┬──────────────┘
                           │
                           ▼
                    FastAPI Backend
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
       PostgreSQL      Gemini API     External APIs
       Database        AI Services    Places / Weather
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                 Personalized Travel
                     Experience
```

---

## Project Structure

```text
raahix/
│
├── backend/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_misc.py
│   │   ├── test_places.py
│   │   ├── test_saved.py
│   │   └── test_trips.py
│   │
│   ├── auth_routes.py
│   ├── chat_routes.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── places_routes.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── saved_routes.py
│   ├── schemas.py
│   ├── security.py
│   ├── trip_schemas.py
│   ├── trips_routes.py
│   └── weather_routes.py
│
├── frontend/
│   ├── assets/
│   │   └── images/
│   ├── css/
│   ├── js/
│   ├── assistant.html
│   ├── budget.html
│   ├── create-trip.html
│   ├── dashboard.html
│   ├── events.html
│   ├── explore.html
│   ├── flights.html
│   ├── index.html
│   ├── itinerary.html
│   ├── login.html
│   ├── place.html
│   ├── profile.html
│   ├── register.html
│   ├── saved.html
│   └── trip-details.html
│
├── .gitignore
├── .python-version
├── README.md
└── requirements.txt
```

> The structure may evolve as additional features are implemented.

---

## Getting Started

### Prerequisites

* Python 3.10+
* Git
* VS Code or another code editor
* PostgreSQL for production-like local development, or SQLite for basic local development

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/RAAHIX.git
cd RAAHIX
```

### Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
GEMINI_FALLBACK_MODEL=your_fallback_model

GEOAPIFY_API_KEY=your_geoapify_api_key
```

> Never commit API keys, passwords, or other secrets to GitHub.

### Run the Backend

```bash
uvicorn main:app --reload
```

The backend will run locally at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### Run the Frontend

Open the frontend using VS Code Live Server.

Example:

```text
http://127.0.0.1:5500
```

Make sure the frontend API configuration points to the FastAPI backend.

---

## Application Workflow

```text
1. User Registration / Login
              │
              ▼
2. Authentication using JWT
              │
              ▼
3. Enter Destination & Trip Preferences
              │
              ▼
4. Backend Processes User Requirements
              │
       ┌──────┴──────┐
       ▼             ▼
   Gemini AI     External APIs
       │          Places / Weather
       └──────┬──────┘
              ▼
5. Personalized Travel Plan
              │
              ▼
6. Explore Places & Recommendations
              │
              ▼
7. Save Interesting Places
              │
              ▼
8. Review Budget & Trip Information
              │
              ▼
9. Continue Planning with AI Assistant
```

---

## Future Improvements

* **Google Maps Platform Integration** — Add richer maps, directions, routes, distance calculations, and location-based recommendations. Some Google Maps Platform services may require billing or paid usage depending on the API and usage level.

* **AI-Generated Travel Images** — Integrate paid AI image-generation capabilities to generate destination illustrations, itinerary visuals, and personalized travel imagery.

* **Advanced RAG-Based Travel Assistant** — Build a Retrieval-Augmented Generation system using curated travel information for more grounded recommendations.

* **Hotel Recommendations** — Add accommodation discovery and comparison.

* **Flight Information** — Integrate flight search and travel-time information.

* **Restaurant Recommendations** — Add location-based restaurant discovery.

* **Interactive Maps & Routes** — Provide optimized routes between multiple destinations.

* **PDF Itinerary Export** — Allow users to download complete travel plans as PDF documents.

* **Collaborative Trip Planning** — Allow multiple users to create and manage trips together.

* **Multi-Language Support** — Provide travel planning and AI assistance in multiple languages.

* **Personalized Recommendations** — Improve recommendations based on saved places and previous trips.

* **Mobile / PWA Support** — Extend the application into a mobile-friendly Progressive Web App.

---

## Screenshots

Screenshots of the application will be added here to showcase the main user flows and interface.

### Home / Landing Page

<img width="1882" height="862" alt="image" src="https://github.com/user-attachments/assets/15fcca1e-570a-4e57-b4d1-0fe6e1060192" />
<img width="1887" height="857" alt="image" src="https://github.com/user-attachments/assets/ff9976c1-2092-4560-baf0-f7252b5bef58" />
<img width="1891" height="871" alt="image" src="https://github.com/user-attachments/assets/2ea7209f-4c6a-482f-be8b-062aaf5f1c71" />
<img width="1896" height="857" alt="image" src="https://github.com/user-attachments/assets/3a47cdb4-27c0-43db-a14f-4f1670d64ab6" />

### Explore Places

<img width="1883" height="877" alt="image" src="https://github.com/user-attachments/assets/aefcbbd8-fce3-4c5e-8f6a-e9571fd837c1" />
<img width="1870" height="860" alt="image" src="https://github.com/user-attachments/assets/0f7761ee-5924-4252-9492-c30547868025" />

### AI Trip Planner

<img width="1882" height="877" alt="image" src="https://github.com/user-attachments/assets/491394fd-d348-4007-a766-060c9008dab1" />

### Trip Dashboard

<img width="1917" height="865" alt="image" src="https://github.com/user-attachments/assets/7ef8cbe9-53e1-42b4-8cd3-46682d741c5e" />
<img width="1896" height="865" alt="image" src="https://github.com/user-attachments/assets/1f618eb7-89dc-4fef-9057-b0b259bd8a2d" />

### Saved Places

<img width="1907" height="873" alt="image" src="https://github.com/user-attachments/assets/fe51533e-a87b-41e2-ac5e-dee356ac4750" />

### AI Travel Assistant

<img width="1908" height="867" alt="image" src="https://github.com/user-attachments/assets/eaa6a55f-afdc-4958-9271-dbec56221090" />
<img width="1882" height="866" alt="image" src="https://github.com/user-attachments/assets/d80776dc-5908-42d2-a1b2-57735c0c638c" />
<img width="1905" height="876" alt="image" src="https://github.com/user-attachments/assets/29e5cbb7-4ecd-4c02-9782-6c53ff16962a" />
<img width="1902" height="861" alt="image" src="https://github.com/user-attachments/assets/5ae78d6a-54c1-4803-8416-66b9d7deef7d" />


---

## References & Inspiration

The product research and design direction for RAAHIX were informed by studying existing travel-planning platforms and AI-assisted travel experiences.

### MakeMyTrip

Used as a reference for understanding conventional travel planning workflows, destination discovery, trip organization, and travel-related user experience patterns.

### Mindtrip

Used as a reference for exploring AI-assisted travel planning, conversational trip discovery, personalized recommendations, and itinerary generation.

> **Note:** RAAHIX is an independently developed project. These platforms were reviewed for product research, feature ideation, and UX inspiration. RAAHIX does not use their proprietary code, content, branding, or internal systems.

---

## API Documentation

RAAHIX uses FastAPI to expose modular REST APIs.

### Authentication

```text
/api/auth
```

Handles:

* User registration
* User login
* JWT authentication

### Trips

```text
/api/trips
```

Handles:

* Trip creation
* Trip retrieval
* Trip management

### Saved Places

```text
/api/saved
```

Handles:

* Save places
* Retrieve saved places
* Manage saved places

### AI Assistant

```text
/api/chat
```

Handles:

* AI travel conversations
* Travel recommendations
* Trip assistance

### Health Check

```text
/api/health
```

Example response:

```json
{
  "status": "ok",
  "app": "RAAHIX"
}
```

---

## Deployment

RAAHIX is deployed using **Railway**.

```text
RAAHIX Backend
      │
      ▼
   Railway
      │
      ├── FastAPI Application
      │
      └── PostgreSQL Database
```

Production environment variables are configured through Railway and are not stored in the repository.

---

## Security

RAAHIX follows basic application security practices:

* JWT-based authentication
* Protected API endpoints
* Environment variables for API credentials
* Secrets excluded from version control
* User-specific data access
* HTTPS for production deployment

---

## 👩‍💻 Developer

**Nikki Ram**

B.E. Artificial Intelligence & Machine Learning
Alard College of Engineering & Management
Savitribai Phule Pune University

### Profiles

* LinkedIn: https://www.linkedin.com/in/nikki-ram-339244289/
* GitHub: https://github.com/Nikkiram435
* Portfolio: https://nikkiram435.github.io/portfolio/

---

## 📄 License

This project is developed for educational, portfolio, and demonstration purposes.
