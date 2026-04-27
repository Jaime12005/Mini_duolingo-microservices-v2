# 🧠 Copilot Instructions - Duolingo Microservices Platform

## 📌 Project Overview

This project is a **Duolingo-inspired language learning platform** built using a **microservices architecture**.

The system focuses on:

* Scalability
* Modularity
* Extensibility
* Clean architecture
* Real-world backend practices

---

## 🏗️ High-Level Architecture

```
[ React Client ]
        │
        ▼
[ API Gateway ]
        │
 ┌──────┼────────┬────────┬────────┬────────┬────────┐
 ▼      ▼        ▼        ▼        ▼        ▼
User  Content  Vocabulary Pronunciation Multimedia Gamification
Svc    Svc        Svc          Svc         Svc          Svc
```

---

## 🧩 Microservices Breakdown

### 👤 1. User Service

**Responsibility:** User management and authentication

**Features:**

* User registration
* Login (JWT-based authentication)
* User profile management
* Streak tracking
* Basic user data

**Database Tables:**

* users
* user_profiles
* user_streaks

---

### 📚 2. Content Service

**Responsibility:** Educational content

**Features:**

* Lessons
* Exercises
* Units / modules

**Database Tables:**

* lessons
* exercises
* categories
* courses

---

### 🧠 3. Vocabulary Service (Custom Enhancement)

**Responsibility:** Deep vocabulary learning

**Features:**

* Multiple meanings per word
* IPA pronunciation
* Example sentences
* Associated audio

**Database Tables:**

* words
* meanings
* examples

---

### 🎤 4. Pronunciation Service (Custom Enhancement)

**Responsibility:** Speech evaluation

**Features:**

* Audio input processing
* Basic pronunciation scoring
* Feedback generation

**Database Tables:**

* evaluations
* results

---

### 🎨 5. Multimedia Service

**Responsibility:** Media management

**Features:**

* Image storage
* Audio storage
* Media metadata
* Future S3/CDN integration

**Database Tables:**

* media_files
* media_storage
* media_metadata

---

### 🎮 6. Gamification Service

**Responsibility:** User engagement system

**Features:**

* XP system
* Levels
* Streaks
* Achievements
* Rankings

**Database Tables:**

* user_xp
* user_levels
* user_achievements
* leaderboards

---

### 🌐 7. API Gateway

**Responsibility:** Entry point for all requests

**Features:**

* Request routing
* JWT validation
* Rate limiting (future)
* Centralized error handling

---

## 🔐 Authentication Flow

1. User logs in → User Service validates credentials
2. User Service generates JWT
3. Client stores JWT
4. All requests go through API Gateway
5. Gateway validates token before forwarding request

---

## 🔄 Inter-Service Communication

**Current approach:**

* REST APIs

**Examples:**

* Content Service → Vocabulary Service
* Content Service → Gamification Service
* User Service → Gamification Service

---

## 🧠 Architectural Principles

### ✔ Modularity

Each microservice is independent:

* Own logic
* Own database
* Own deployment

---

### ✔ Low Coupling / High Cohesion

* Services do NOT share databases
* Communication only via APIs

---

### ✔ Extensibility

New services can be added without breaking the system:

* Vocabulary Service
* Pronunciation Service

---

### ✔ Portability

* Node.js environment
* Docker-ready (future)

---

### ✔ Multimedia / Hypermedia

System integrates:

* Text (lessons)
* Audio (pronunciation)
* Images (learning context)
* Interactive exercises

---

## 🧱 Backend Structure (Per Microservice)

```
src/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middleware/
├── validators/
├── utils/
├── config/
├── db/
```

---

## ⚙️ Technology Stack

* Node.js
* Express.js
* TypeScript
* MySQL
* JWT (Authentication)
* bcrypt (Password hashing)
* Zod (Validation)
* React (Frontend)

---

## 🧬 Data Design Rules

### 🔑 IDs

* All IDs must use UUID
* Stored as: `VARCHAR(36)`
* Generated in backend (NOT DB)

```ts
import { v4 as uuidv4 } from 'uuid';
```

---

### ❌ Forbidden

* AUTO_INCREMENT
* Numeric IDs
* insertId usage

---

## 🔐 Security Rules

* Passwords must be hashed using bcrypt (min salt rounds = 10)
* Never expose internal errors to client
* Login must always return:

  * "Invalid credentials" (generic message)
* JWT must be signed using environment variables

---

## 📦 API Standards

### Base path:

```
/api/v1/
```

### Response format:

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "error": null
}
```

---

## ⚠️ Development Rules (VERY IMPORTANT)

### ❌ DO NOT:

* Generate entire microservices in one request
* Mix controller logic with business logic
* Use number as ID
* Call database directly from controller

---

### ✅ ALWAYS:

* Follow Controller → Service → Repository pattern
* Validate input using Zod (validators folder)
* Keep services clean and focused
* Build incrementally (step by step)

---

## 🚀 Development Strategy

Work in phases:

### Phase 1 (Current)

* User Service
* Authentication (register + login)
* Validation (Zod)

### Phase 2

* JWT middleware
* Route protection

### Phase 3

* API Gateway

### Phase 4

* Additional microservices

---

## 🧪 Example Flow

### User Registration

1. Client sends request
2. Controller receives request
3. Validator validates input
4. Service handles logic
5. Repository interacts with DB
6. Response returned

---

## 🧠 Important Notes for Copilot

* Prefer clean, modular code
* Avoid overengineering
* Follow TypeScript best practices
* Keep functions small and readable
* Do not introduce unnecessary dependencies
* Respect architecture boundaries

---

## 🎯 Goal

Build a scalable, production-ready backend inspired by Duolingo, applying real-world software engineering principles and microservices architecture.
