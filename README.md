🇳🇵 BloggyNepal

Discover Nepal. Plan Your Journey. Experience More.

BloggyNepal is a full-stack Nepal tourism platform designed to help travelers discover destinations, explore travel stories, find activities, and plan their journeys across Nepal.

🌐 Live Demo: https://bloggy-nepal.vercel.app
📦 Repository: https://github.com/Prayash17/bloggyNepal

⸻

✨ Features

🗺️ Destination Discovery

* Explore destinations across Nepal
* Detailed destination pages
* Travel information and highlights
* Activities and experiences
* Route and itinerary information
* Cost and travel guidance

📖 Travel Stories

* Destination-based stories
* Rich content powered by Sanity CMS
* Dynamic story pages
* SEO-friendly content structure

🔎 Search & Discovery

* Search destinations and content
* Explore destinations by categories
* Dynamic content discovery

💬 Community Features

* User comments
* Reactions
* Subscriber system
* User engagement

🛠️ Admin Dashboard

* Content management
* Comment management
* Subscriber management
* Activity monitoring
* Administrative controls

📱 Responsive Experience

Designed for desktop, tablet and mobile users.

⸻

🧱 Tech Stack

Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

Backend

* Next.js API routes
* Supabase
* PostgreSQL

CMS

* Sanity CMS

Deployment

* Vercel
* GitHub

Development

* ESLint
* Git
* GitHub

⸻

🏗️ Architecture

                         ┌─────────────────┐
                         │     User        │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    Next.js      │
                         │  React + TS     │
                         └───────┬─────────┘
                                 │
                   ┌─────────────┼─────────────┐
                   │             │             │
                   ▼             ▼             ▼
              ┌────────┐   ┌──────────┐   ┌──────────┐
              │ Sanity │   │ Supabase │   │   APIs   │
              │  CMS   │   │PostgreSQL│   │          │
              └────────┘   └──────────┘   └──────────┘
                   │             │             │
                   └─────────────┼─────────────┘
                                 ▼
                          ┌─────────────┐
                          │   Vercel    │
                          │ Production  │
                          └─────────────┘

⸻

📂 Project Structure

bloggyNepal/
├── public/
├── sanity/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md

⸻

🎯 Project Goals

BloggyNepal aims to create a centralized platform for discovering Nepal’s:

* Destinations
* Districts
* Activities
* Travel stories
* Itineraries
* Travel information

The long-term goal is to make Nepal easier to explore for both domestic and international travelers.

⸻

🚀 Future Development

* [ ]	AI-powered Nepal Trip Planner
* [ ]	Personalized itinerary generation
* [ ]	Advanced destination search
* [ ]	User authentication
* [ ]	Saved destinations
* [ ]	Advanced admin analytics
* [ ]	Automated testing
* [ ]	Performance optimization
* [ ]	Progressive Web App features

⸻

🧪 Development

Clone the repository:

git clone https://github.com/Prayash17/bloggyNepal.git
cd bloggyNepal

Install dependencies:

npm install

Create your environment file:

cp .env.example .env.local

Add the required environment variables.

Run the development server:

npm run dev

Open:

http://localhost:3000

⸻

👨‍💻 Developer

Prayash

Full-Stack Developer focused on building modern web applications and AI-powered products.

Interests

* Full-Stack Development
* Next.js
* TypeScript
* PostgreSQL
* AI Engineering
* Automation
* Cloud Deployment

⸻

📄 License

This project is currently maintained as a personal portfolio and product project.
