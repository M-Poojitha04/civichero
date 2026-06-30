# 🦸 CivicHero – AI-Powered Community Issue Management Platform

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Express](https://img.shields.io/badge/Express.js-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange)
![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-red)
![License](https://img.shields.io/badge/License-MIT-success)

## Overview

**CivicHero** is an AI-powered smart city platform that enables citizens and municipal authorities to collaboratively identify, verify, track, and resolve community issues such as potholes, water leakages, damaged streetlights, overflowing waste bins, road hazards, and public infrastructure problems.

The platform combines Artificial Intelligence, geospatial visualization, community validation, real-time analytics, and municipal operations into a unified digital ecosystem that improves transparency, accountability, and civic participation.

Built for the **Community Hero – Hyperlocal Problem Solver** challenge, CivicHero demonstrates how AI can transform public service delivery by making issue reporting faster, smarter, and more transparent.

---

# Problem Statement

Communities regularly face infrastructure and civic issues including:

* Road damage and potholes
* Water pipeline leakages
* Broken streetlights
* Waste management problems
* Public infrastructure failures

Traditional reporting systems are fragmented, lack transparency, provide little visibility into progress, and rarely encourage community participation.

CivicHero addresses these challenges through AI-assisted reporting, citizen collaboration, intelligent verification, and municipal decision support.

---

# Key Features

## AI-Powered Citizen Reporting

* Upload issue photos for instant analysis
* AI-powered issue categorization using Gemini
* Automatic severity assessment
* Duplicate report detection
* Estimated repair cost prediction
* GPS-aware location identification
* Smart metadata extraction

---

## Interactive City Map

* Live issue visualization
* Color-coded incident markers
* Active, Pending, and Resolved issue filtering
* Geographic clustering
* Before/After repair comparison slider
* Location-aware navigation

---

## Community Verification

Citizens actively participate by:

* Verifying reported incidents
* Upvoting legitimate reports
* Flagging incorrect submissions
* Confirming completed repairs

This community-driven validation improves report accuracy and transparency.

---

## Municipal Operations Dashboard

Designed for city administrators, the dashboard includes:

* Executive incident overview
* Department-wise workload
* SLA compliance tracking
* Ward performance monitoring
* Resolution analytics
* Infrastructure health metrics
* Historical trend analysis

---

## AI Civic Advisor

An integrated Gemini-powered assistant capable of:

* Answering municipal questions
* Explaining civic statistics
* Summarizing issue trends
* Drafting commissioner action plans
* Providing operational insights
* Natural language analytics

---

## Multilingual Reporting

Citizens can report issues in regional languages.

The platform automatically translates submissions into English to enable standardized municipal processing.

---

## Real-Time Operations Feed

Live operational updates including:

* Newly reported incidents
* Emergency alerts
* Department activity
* Resolution updates
* Community verification events

---

## Reputation & Gamification

Encourages civic participation through:

* Reporter badges
* Validator badges
* Hero rankings
* Super Hero achievements
* Community reputation scoring

---

## Before & After Resolution Gallery

Each resolved issue can display:

* Original damage image
* Verified repair image
* Interactive comparison slider
* Resolution proof

---

## Google Drive Asset Synchronization

Administrators can connect a Google account and synchronize verified field images from a folder named:

`CivicHero Assets`

This replaces placeholder assets with real inspection photographs.

---

# AI Capabilities

CivicHero leverages Google Gemini for intelligent automation.

### AI-powered Features

* Image-based issue recognition
* Issue categorization
* Severity prediction
* Duplicate detection
* Cost estimation
* Multilingual translation
* Visual infrastructure auditing
* Conversational civic assistant
* Municipal analytics
* Natural language reporting

---

# Technology Stack

## Frontend

* React 18
* TypeScript
* Tailwind CSS
* Motion
* Recharts
* D3.js
* Vite

---

## Backend

* Express.js
* Node.js
* TypeScript

---

## Database

### Cloud Mode

* PostgreSQL
* Drizzle ORM
* pg Connection Pool

### Local Offline Mode

A custom file-based database engine using:

```
civichero_local_db.json
```

Features include:

* Automatic cloud/local detection
* Local persistence
* Query simulation
* Transaction handling
* Seed data loading
* Offline development support

---

## Authentication

* Firebase Authentication
* Google Sign-In
* Offline developer authentication wrappers

---

## AI Integration

* Google Gemini API
* @google/genai SDK
* Multimodal AI
* Structured Outputs

---

## Build & Developer Tools

* Vite
* TypeScript
* esbuild
* tsx
* npm

---

# System Architecture

```
Citizen
     │
     ▼
React Frontend
     │
     ▼
Express API Gateway
     │
 ┌───┴─────────────┐
 ▼                 ▼
Gemini AI     PostgreSQL
                   │
                   ▼
      Local JSON Database
        (Offline Fallback)
```

---

# Major Modules

## Interactive Civic Map

* Live issue visualization
* Geolocation
* Incident filtering
* Resolution slider

---

## Citizen Reporting Portal

* AI image analysis
* GPS tagging
* Smart categorization
* Duplicate detection

---

## Verification Center

* Community validation
* Resolution verification
* Reputation management

---

## Municipal Headquarters

* Operational dashboard
* Executive analytics
* Department monitoring
* SLA metrics

---

## AI Civic Advisor

* Conversational analytics
* Operational intelligence
* Dataset interpretation

---

# Dashboard Analytics

The platform provides rich analytical visualizations including:

* Active vs Resolved incidents
* Department SLA compliance
* Ward health index
* Incident category distribution
* Municipal workload comparison
* Historical trends
* Resolution performance

---

# Offline-First Development

One of CivicHero's standout features is its dual-mode architecture.

If cloud credentials are unavailable, the application automatically switches to the local data engine without requiring any configuration.

This enables:

* Local development
* Demo environments
* Offline testing
* Consistent application behavior

---

# Project Structure

```
CivicHero/
│
├── src/
│   ├── components/
│   ├── db/
│   ├── middleware/
│   ├── lib/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   └── assets/
│
├── civichero_local_db.json
├── server.ts
├── package.json
└── README.md
```

---

# Running Locally

## Clone Repository

```bash
git clone https://github.com/M-Poojitha04/civichero.git
cd civichero
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

The application automatically detects whether cloud database credentials are available.

If not, it seamlessly falls back to the local JSON database.

---

# Future Enhancements

* Mobile application
* Push notifications
* IoT sensor integration
* Drone-assisted inspections
* Predictive maintenance models
* AI-generated repair prioritization
* Smart traffic integration
* Open municipal APIs
* Citizen reward marketplace
* Voice-based reporting

---

# Evaluation Alignment

✅ Image & AI-based reporting

✅ AI-powered issue categorization

✅ Geo-location & mapping

✅ Community verification

✅ Real-time issue tracking

✅ Municipal dashboards

✅ Predictive insights

✅ Gamification

✅ Transparency & accountability

---

# Built For

**Community Hero – Hyperlocal Problem Solver**

An AI-driven solution demonstrating how intelligent automation can improve civic reporting, verification, transparency, and public infrastructure management.

---

# Contributors

Developed with ❤️ to make communities smarter, safer, and more connected.
