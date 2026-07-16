# NextTask — Full-Stack Task Management System

**NextTask** is a full-stack web application for creating, assigning, tracking, and managing tasks with role-based access control. It consists of an **ASP.NET Core Web API** backend and an **Angular 18** frontend, connected over REST with **JWT authentication**.

This document is written to support academic reports, internship portfolios, and presentation (PPT) slides.

---

## 1. Project Overview

| Aspect | Details |
|--------|---------|
| **Project Name** | NextTask |
| **Type** | Full-stack Task Management System |
| **Architecture** | Client–Server (SPA + REST API) |
| **Backend** | ASP.NET Core Web API (`.NET 10`) |
| **Frontend** | Angular 18 + Angular Material |
| **Database** | SQLite (`nexttask.db`) via Entity Framework Core |
| **Authentication** | JWT Bearer Token |
| **Authorization** | Role-Based Access Control (Admin / User) |

### Purpose

NextTask helps individuals and small teams:

- Register and log in securely
- Create, update, and delete tasks
- Track task status (Todo → In Progress → Completed)
- Set priority and due dates
- View a dashboard with summary statistics
- Filter, search, and sort tasks
- Enforce role-based visibility (users see only their tasks; admins see all)

---

## 2. Problem Statement

Manual task tracking (notebooks, spreadsheets, chat messages) leads to missed deadlines, unclear ownership, and no centralized progress view. NextTask solves this by providing:

1. A **centralized task store** with status, priority, and due dates  
2. **Secure multi-user access** with hashed passwords and JWT sessions  
3. **Role-based rules** so standard users cannot access others’ work  
4. A **dashboard** for quick visibility into workload and overdue items  
5. A **responsive UI** usable on desktop and mobile  

---

## 3. Objectives

1. Build a RESTful API for authentication and task CRUD operations  
2. Implement secure login with JWT and password hashing (BCrypt)  
3. Apply layered architecture (Controller → Service → Repository → Database)  
4. Support Admin and User roles with different permissions  
5. Provide an Angular SPA with dashboard, task list, and forms  
6. Enable search, filter, sort, and overdue detection  
7. Seed demo data for easy testing and demonstration  

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Angular 18 Frontend                      │
│         (nexttask-ui — localhost:4200)                       │
│  Login | Register | Dashboard | Task List | Task Form        │
│  Auth Guard | HTTP Interceptor | Angular Material UI         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/HTTP + JWT Bearer
                            │ REST JSON (api/*)
┌───────────────────────────▼─────────────────────────────────┐
│              ASP.NET Core Web API (NextTaskAPI)              │
│                   (localhost:5292)                           │
│  Controllers → Services → Repositories → EF Core             │
│  JWT Auth | CORS | Exception Middleware | OpenAPI            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    SQLite Database                           │
│              nexttask.db (Users + Tasks)                     │
└─────────────────────────────────────────────────────────────┘
```

### Layered Backend Design

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **Controllers** | HTTP endpoints, auth claims | `AuthController`, `TasksController` |
| **Services** | Business rules, authorization | `UserService`, `TaskService`, `TokenService` |
| **Repositories** | Data access / queries | `UserRepository`, `TaskRepository` |
| **Models / DTOs** | Domain entities & API contracts | `User`, `TaskItem`, `TaskCreateRequest` |
| **Data** | EF Core context & seeding | `AppDbContext`, `DbInitializer` |
| **Middleware** | Global error handling | `ExceptionMiddleware` |

---

## 5. Tools & Technologies Used

### 5.1 Backend Stack

| Technology | Version / Package | Role in Project |
|------------|-------------------|-----------------|
| **C# / .NET** | .NET 10 (`net10.0`) | Primary backend language & runtime |
| **ASP.NET Core Web API** | Microsoft.NET.Sdk.Web | REST API framework |
| **Entity Framework Core** | 9.0.0 | ORM for database operations |
| **EF Core SQLite** | 9.0.0 | Lightweight file-based database provider |
| **JWT Bearer Auth** | Microsoft.AspNetCore.Authentication.JwtBearer 9.0.0 | Stateless token authentication |
| **BCrypt.Net-Next** | 4.0.3 | Secure password hashing |
| **OpenAPI** | Microsoft.AspNetCore.OpenApi 10.0.9 | API documentation endpoint |
| **SQLite** | `nexttask.db` | Persistent storage without a DB server |

### 5.2 Frontend Stack

| Technology | Version | Role in Project |
|------------|---------|-----------------|
| **Angular** | 18.2 | SPA framework |
| **TypeScript** | ~5.5 | Typed frontend language |
| **Angular Material / CDK** | 18.2 | UI components (forms, sidenav, cards, dialogs) |
| **RxJS** | ~7.8 | Reactive HTTP streams |
| **Angular Router** | 18.2 | Client-side routing & guards |
| **Vite** (via Angular CLI) | Build tooling | Fast local development builds |
| **Node.js** | 18+ | Runtime for npm / Angular CLI |

### 5.3 Development & Supporting Tools

| Tool | Purpose |
|------|---------|
| **Visual Studio Code / Cursor** | Code editing & debugging |
| **.NET CLI (`dotnet`)** | Build, run, restore backend |
| **Angular CLI (`ng`)** | Scaffold, serve, build frontend |
| **npm** | Frontend package management |
| **Git** | Version control |
| **HTTP file (`NextTaskAPI.http`)** | Manual API testing from the IDE |
| **Browser DevTools** | Network / JWT / UI debugging |

### 5.4 Why These Technologies? (Useful for viva / PPT)

- **ASP.NET Core** — high-performance, cross-platform, strong typing, built-in DI and middleware pipeline  
- **Angular** — structured SPA with modules/components, routing, and dependency injection  
- **SQLite** — zero-config DB ideal for demos, internships, and local development  
- **EF Core** — reduces boilerplate SQL; supports LINQ queries and relationships  
- **JWT** — scalable, stateless auth suitable for SPAs  
- **BCrypt** — industry-standard one-way hashing (passwords never stored in plain text)  
- **Angular Material** — consistent, accessible UI without building components from scratch  

---

## 6. Key Features

### Authentication & Security
- User **registration** and **login**
- Passwords stored as **BCrypt hashes**
- **JWT** issued on login (valid ~7 days)
- Session restore via `/api/auth/me`
- HTTP interceptor attaches `Authorization: Bearer <token>` on frontend
- Route **guards** protect authenticated pages and redirect guests

### Role-Based Access Control (RBAC)

| Capability | Admin | User |
|------------|-------|------|
| View all tasks | Yes | No (own only) |
| Create tasks | Yes | Yes (self-assigned) |
| Assign task to another user | Yes | No |
| Edit / delete any task | Yes | Own tasks only |
| List all users | Yes | No |
| Dashboard (scoped) | All tasks | Own tasks |

### Task Management
- Create, read, update, delete (CRUD)
- Fields: title, description, priority, status, due date, assignee
- Priorities: `Low`, `Medium`, `High`
- Statuses: `Todo`, `InProgress`, `Completed`
- Search by text
- Filter by status, priority, overdue
- Sort options (e.g. by priority)

### Dashboard
Summary cards showing:
- Total tasks  
- Todo / In Progress / Completed counts  
- Overdue tasks (due date in the past and not completed)

### UI / UX
- Login & register screens  
- Responsive shell with sidenav (drawer on mobile)  
- Dashboard summary  
- Task list with filters  
- Task create/edit forms  
- Admin can pick assignee when creating/editing tasks  

---

## 7. Project Structure

```
TaskManager/                          (solution root)
├── TaskManager/                      ← Backend (NextTaskAPI)
│   ├── Controllers/
│   │   ├── AuthController.cs         # Register, login, me, list users
│   │   └── TasksController.cs        # Task CRUD + dashboard
│   ├── Services/                     # Business logic
│   ├── Repositories/                 # Data access
│   ├── Models/                       # User, TaskItem, Enums
│   ├── DTOs/                         # Request/response contracts
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── DbInitializer.cs          # Seed users & sample tasks
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs
│   ├── Program.cs                    # DI, JWT, CORS, pipeline
│   ├── appsettings.json
│   ├── nexttask.db                   # SQLite database file
│   └── NextTaskAPI.csproj
│
└── nexttask-ui/                      ← Frontend (Angular)
    ├── src/app/
    │   ├── core/                     # Auth service, guards, interceptor, models
    │   ├── features/
    │   │   ├── auth/                 # Login, Register
    │   │   ├── dashboard/
    │   │   └── tasks/                # Task list & form
    │   ├── layout/shell/             # App shell + sidenav
    │   ├── app.routes.ts
    │   └── app.config.ts
    ├── src/environments/
    └── package.json
```

---

## 8. Data Model

### User

| Field | Type | Notes |
|-------|------|-------|
| Id | int | Primary key |
| Username | string | Unique index |
| PasswordHash | string | BCrypt hash |
| Role | enum | `Admin` or `User` |
| CreatedDate | DateTime | UTC |

### TaskItem

| Field | Type | Notes |
|-------|------|-------|
| Id | int | Primary key |
| Title | string | Required (3–100 chars) |
| Description | string? | Optional |
| Priority | enum | Low / Medium / High |
| Status | enum | Todo / InProgress / Completed |
| DueDate | DateTime? | Optional |
| CreatedDate / UpdatedDate | DateTime | Audit fields |
| AssignedUserId | int? | FK → User (SetNull on delete) |

---

## 9. API Endpoints

Base URL (development): `http://localhost:5292/api`

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login → JWT |
| GET | `/auth/me` | Yes | Validate session / current user |
| GET | `/auth/users` | Admin | List all users |

### Tasks (`/api/tasks`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | Yes | List tasks (search, filter, sort) |
| GET | `/tasks/{id}` | Yes | Get one task |
| POST | `/tasks` | Yes | Create task |
| PUT | `/tasks/{id}` | Yes | Update task |
| DELETE | `/tasks/{id}` | Yes | Delete task |
| GET | `/tasks/dashboard` | Yes | Dashboard summary |

**Query parameters for `GET /tasks`:**  
`search`, `status`, `priority`, `sortBy`, `showOverdue`

---

## 10. Security Design

1. **Password hashing** — BCrypt; never store plain-text passwords  
2. **JWT** — signed with HMAC-SHA256; validates issuer, audience, lifetime  
3. **Claims** — user id, username, role embedded in token  
4. **Authorization attributes** — `[Authorize]`, `[Authorize(Roles = "Admin")]`  
5. **Service-level checks** — users cannot view/edit/delete others’ tasks  
6. **CORS** — allows the Angular frontend to call the API  
7. **Global exception middleware** — consistent JSON error responses; stack traces only in Development  

---

## 11. Demo / Seed Accounts

On first run, the API creates the SQLite database and seeds sample data.

| Username | Password | Role |
|----------|----------|------|
| `admin` | `Admin@123` | Admin |
| `john` | `User@123` | User |

Sample tasks include completed, in-progress, todo, and overdue items for demonstration.

---

## 12. How to Run

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- npm (comes with Node)

### Step 1 — Start the API

```bash
cd TaskManager
dotnet restore
dotnet run --launch-profile http
```

API: **http://localhost:5292**

### Step 2 — Start the Angular UI

```bash
cd ../nexttask-ui
npm install
npm start
```

UI: **http://localhost:4200**

Open the browser at `http://localhost:4200`, log in with a demo account, and explore Dashboard and Tasks.

---

## 13. Suggested Report / PPT Outline

Use this structure for documentation or slides:

1. **Title slide** — NextTask: Full-Stack Task Management System  
2. **Introduction** — Need for digital task tracking  
3. **Objectives** — Section 3 above  
4. **System architecture** — Diagram from Section 4  
5. **Tools & technologies** — Tables from Section 5 (high visual impact)  
6. **Features** — Auth, RBAC, CRUD, Dashboard, Filters  
7. **Database design** — User & Task entities / ER relationship  
8. **API design** — Endpoint summary  
9. **Security** — JWT + BCrypt + roles  
10. **UI screenshots** — Login, Dashboard, Task list  
11. **Implementation highlights** — Layered architecture, Angular guards  
12. **Conclusion & future scope** — See below  

### Future Scope (for conclusion slides)
- Email / push reminders for overdue tasks  
- Task comments and file attachments  
- Team / project workspaces  
- PostgreSQL or SQL Server for production  
- Refresh tokens and stronger JWT rotation  
- Unit / integration test suite  
- Docker deployment  

---

## 14. Learning Outcomes

Building NextTask demonstrates practical skills in:

- Full-stack development (C# API + Angular SPA)  
- REST API design and DTO validation  
- ORM usage with Entity Framework Core  
- Authentication and authorization (JWT, RBAC)  
- Clean layered architecture and dependency injection  
- Responsive UI with Angular Material  
- Local database setup and data seeding  

---
