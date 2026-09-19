# AlgoViz — Interactive Algorithm & Data Structure Visualizer

AlgoViz is a full-stack educational algorithm visualization platform. It pairs an authoritative C++ algorithm execution engine with a Node.js/Express API bridge and a modern, accessible React/TypeScript browser visualizer.

---

## Architecture Overview

```text
React Frontend (Vite / TypeScript / SPA)
         ↓  HTTP (REST API)
Node.js / Express Backend (API Gateway & Process Manager)
         ↓  stdio JSON Pipeline
C++ Headless Engine (algoviz-engine)
```

1. **C++ Algorithm Engine (`algoviz-engine`)**: The authoritative source of truth. Executes algorithms natively and emits deterministic JSON event traces with state snapshots and micro-step telemetry.
2. **Backend API (`algoviz-backend`)**: Node.js/Express service enforcing strict validation, timeout (3000 ms), stdout byte limits (5 MB), concurrency throttling (20 processes), CORS, and SQLite catalog persistence.
3. **Frontend Visualizer (`algoviz-frontend`)**: Responsive React SPA consuming engine event traces via a unified playback controller (play, pause, step, seek, variable speed) with specialized visualizers for Arrays, Searches, Data Structures, Trees, and Graphs.
4. **Interactive CLI (`AlgoViz.exe`)**: Terminal-based ASCII visualizer with interactive step-by-step partition and tree rendering.

---

## Supported Algorithms (14)

| Category | Algorithms |
| :--- | :--- |
| **Sorting** | Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort |
| **Searching** | Linear Search, Binary Search |
| **Data Structures** | Stack (LIFO), Queue (FIFO), Singly Linked List |
| **Trees** | Binary Tree (Traversals & Metrics), Binary Search Tree (Insert, Search, Delete) |
| **Graphs** | Breadth-First Search (BFS), Depth-First Search (DFS) |

---

## Complexity Reference

| Module | Algorithm / Structure | Time (Best) | Time (Avg) | Time (Worst) | Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sorting** | Bubble Sort | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ |
| **Sorting** | Selection Sort | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ |
| **Sorting** | Insertion Sort | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ |
| **Sorting** | Merge Sort | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ |
| **Sorting** | Quick Sort | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ |
| **Searching** | Linear Search | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ |
| **Searching** | Binary Search | $O(1)$ | $O(\log n)$ | $O(\log n)$ | $O(1)$ |
| **Data Structures** | Stack (Push/Pop/Top) | $O(1)$ | $O(1)$ | $O(1)$ | $O(n)$ |
| **Data Structures** | Queue (Enqueue/Dequeue) | $O(1)$ | $O(1)$ | $O(1)$ | $O(n)$ |
| **Data Structures** | Linked List (Insert/Delete) | $O(1)$ | $O(n)$ | $O(n)$ | $O(n)$ |
| **Trees** | Binary Tree (Traversals) | $O(n)$ | $O(n)$ | $O(n)$ | $O(h)$ |
| **Trees** | BST (Insert/Search/Delete) | $O(\log n)$ | $O(\log n)$ | $O(n)$ | $O(h)$ |
| **Graphs** | BFS | $O(V + E)$ | $O(V + E)$ | $O(V + E)$ | $O(V)$ |
| **Graphs** | DFS | $O(V + E)$ | $O(V + E)$ | $O(V + E)$ | $O(V)$ |

---

## Deployment & Production Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **C++ Compiler**: GCC / g++ (v6.3+ supporting C++11 or higher) or Clang

### 2. C++ Engine Compilation
On a Linux or cloud container host, the headless engine must be compiled from source into the repository root:

```bash
# Compile headless C++ engine on Linux/POSIX:
g++ -std=c++11 -O2 engine/algoviz_engine.cpp engine/json_observer.cpp sorting/*.cpp searching/*.cpp data_structures/*.cpp trees/*.cpp graphs/*.cpp utils.cpp observer.cpp -o algoviz-engine

# On Windows (MinGW):
g++ -std=c++11 -O2 engine/algoviz_engine.cpp engine/json_observer.cpp sorting/*.cpp searching/*.cpp data_structures/*.cpp trees/*.cpp graphs/*.cpp utils.cpp observer.cpp -o algoviz-engine.exe
```

### 3. Backend Setup & Deployment
The backend runs as a Node.js/Express service.

```bash
cd backend
npm install
npm run build
npm start
```

#### Backend Environment Variables
| Variable | Description | Default | Production Example |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP port to listen on | `5000` | Deployment-provided (e.g. `10000`) |
| `NODE_ENV` | Runtime environment mode | `development` | `production` |
| `DATABASE_PATH` | Path to SQLite database file | `data/algoviz.db` | `data/algoviz.db` |
| `ENGINE_PATH` | Path to compiled C++ binary | `../algoviz-engine` | `../algoviz-engine` |
| `CORS_ORIGIN` | Allowed frontend origin(s) | `http://localhost:3000` | `https://algoviz.example.com` |

#### Security Limits Enforced
- Maximum JSON body size: **100 KB**
- Engine execution timeout: **3000 ms**
- Maximum engine stdout: **5 MB**
- Maximum engine stderr: **64 KB**
- Maximum concurrent engine child processes: **20**

### 4. Frontend Setup & Deployment
The frontend is a static Single Page Application (SPA) built with Vite.

```bash
cd frontend
npm install
npm run build
```

The output bundle is located in `frontend/dist/` and can be served from any static host (Netlify, Vercel, Cloudflare Pages, Render Static, Nginx, or AWS S3/CloudFront).

#### Frontend Environment Variables
| Variable | Description | Default | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API calls | `/api` | `https://api.algoviz.example.com/api` |

#### SPA Direct Routing
The file `frontend/public/_redirects` is bundled into `dist/` with the rule:
```text
/*    /index.html   200
```
This ensures direct client-side routing on page refresh for deep links like `/catalog` and `/visualize/:id`.

---

## Local Development

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## Running Test Suites

```bash
# Backend regression tests (65 tests across 8 suites):
cd backend
npm test

# Frontend unit & integration tests (67 tests across 7 suites):
cd frontend
npm test

# Frontend production typecheck & build:
cd frontend
npm run build
```