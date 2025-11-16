**MedBotX - Architecture & Flow Documentation

**Table of Contents
    System Overview
    Architecture Diagram
    Technology Stack
    Database Schema
    API Endpoints
    Request Flow
    Authentication Flow
    Chat Flow
    Component Structure
    State Management
    Performance Optimizations
    Security Measures

1. System Overview
    MedBotX is a full-stack AI medical chatbot application that provides real-time medical information using ChatGroq's LLaMA 3.3 70B model.

**Key Features
    AI-powered medical assistant
    Real-time streaming responses (SSE)
    JWT-based authentication
    Conversation history management
    Guest and authenticated modes
    Modern dark theme UI
    Handles 100+ concurrent users


2. Architecture Diagram

┌─────────────────────────────── CLIENT LAYER ────────────┐
│ React Frontend (Port 3000)                              │
│ ┌──────────┐  ┌──────────┐  ┌────────────┐              │
│ │ Header   │  │ Sidebar  │  │ ChatWindow │              │
│ └──────────┘  └──────────┘  └────────────┘              │
│ ┌──────────────┐  ┌─────────────┐  ┌──────────┐         │
│ │ AuthContext  │  │ Services    │  │ Hooks     │        │
│ └──────────────┘  └─────────────┘  └──────────┘         │
└─────────────────────────── HTTP / SSE ↓ ────────────────┘


┌────────────────────────────── API GATEWAY LAYER ────────┐
│ FastAPI Backend (Port 8000)                              │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│ │  CORS    │  │   JWT    │  │  Routes  │                 │
│ └──────────┘  └──────────┘  └──────────┘                 │
│    ┌────────────────────────────────────────────────────┐ │
│    │ /api/auth/ (signup, login)                          │ 
│    │ /api/threads/ (GET, POST, PUT, DELETE)              │  
│    │ /api/chat/stream  (SSE streaming)                   │
│    └───────────────────────────────────────────────────  │
└─────────────────────────────── ↓ ───────────────────────┘


┌──────────────────────────────── SERVICE LAYER ───────────────┐
│ ┌──────────────┐  ┌──────────────┐  ┌───────────────┐          │
│ │ UserService  │  │ ChatService  │  │ MemoryService  │       │
│ │ - create     │  │ - stream     │  │ - save         │       │
│ │ - verify     │  │ - build_msgs │  │ - history      │       │
│ └──────────────┘  └──────────────┘  └───────────────┘        │
└─────────────────────────────── ↓ ────────────────────────────┘


┌────────────────────────────── EXTERNAL SERVICES ────────────┐
│ ChatGroq API (Groq Cloud)                                   │
│ • Model: llama-3.3-70b-versatile                            │
│ • Mode: Streaming (Async Generator)                         │
│ • System Prompt: Medical-only responses                     │
└─────────────────────────────── ↓ ───────────────────────── ─┘


┌──────────────────────────────── DATA LAYER ─────────────┐
│ SQLAlchemy ORM                                                     
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│ │ User Model   │  │ Thread Model │  │ Message Model│              
│ └──────────────┘  └──────────────┘  └──────────────┘   │
│ Database: SQLite / PostgreSQL                                      
│ • Tables: users, threads, messages                     │
│ • WAL mode, pooling, timestamps                                    
└────────────────────────────────────────────────────────┘

Frontend

React 18.2.0
├── axios 1.6.2         
├── react-router-dom    
└── CSS3                 
Backend

Python 
├── FastAPI      
├── Uvicorn 
├── SQLAlchemy 
├── Pydantic 
├── python-jose 
├── passlib 
└── langchain-groq      

AI/ML

ChatGroq (Groq Cloud)
└── llama-3.3-70b-versatile   
    ├── Context: 131K tokens
    ├── Speed: 280 tokens/sec
    └── Mode: Streaming

Database

SQLite (Development)
└── WAL mode enabled


4. Database Schema
Entity Relationship Diagram
text
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ hashed_password     │
│ is_active           │
│ created_at          │
└──────────┬──────────┘
           │ 1
           │
           │ *
┌──────────┴──────────┐
│      threads        │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ title               │
│ is_guest            │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │ 1
           │
           │ *
┌──────────┴──────────┐
│      messages       │
├─────────────────────┤
│ id (PK)             │
│ thread_id (FK)      │
│ role                │
│ content             │
│ created_at          │
└─────────────────────┘


5. API Endpoints
Authentication Endpoints

Method	Endpoint	
POST	/api/auth/signup	
POST	/api/auth/login	


Thread Management Endpoints

Method	Endpoint	Description	           Auth Required
GET	/api/threads/	Get all user threads	Optional
POST	/api/threads/	Create new thread	Optional
GET	/api/threads/{id}	Get thread by ID	Optional
PUT	/api/threads/{id}	Update thread title	Optional
DELETE	/api/threads/{id}	Delete thread	Optional
GET	/api/threads/{id}/messages	Get thread messages	Optional


Chat Endpoint


Method	Endpoint	          Description	              Auth Required
POST	/api/chat/stream	Stream AI response (SSE)	Optional





6. Request Flow



Complete User Journey

┌─────────────────────────────────────────────────────────────┐
│                    1. USER ACCESS                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Landing Page   │
                   └────────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Guest Mode      │        │  Login/Signup    │
    │  (Skip Auth)     │        │                  │
    └────────┬─────────┘        └────────┬─────────┘
             │                           │
             │                           ▼
             │                  ┌──────────────────┐
             │                  │ POST /api/auth/  │
             │                  │     signup       │
             │                  └────────┬─────────┘
             │                           │
             │                           ▼
             │                  ┌──────────────────┐
             │                  │  JWT Token       │
             │                  │  Stored in       │
             │                  │  localStorage    │
             │                  └────────┬─────────┘
             │                           │
             └───────────┬───────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                 2. CONVERSATION MANAGEMENT                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │ POST /api/threads/ │
              │ (Create new thread)│
              └──────────┬─────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Thread ID returned           │
         │  Stored in React state        │
         └───────────┬───────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                    3. CHAT INTERACTION                      │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  User types message    │
         │  in MessageInput       │
         └──────────┬─────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │ POST /api/chat/stream  │
         │  {thread_id, message}  │
         └──────────┬─────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐    ┌──────────────────┐
│  Save user    │    │  Get conversation│
│  message to DB│    │  history from DB │
└───────┬───────┘    └────────┬─────────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │  ChatGroq API Call   │
         │  with history +      │
         │  system prompt       │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Stream response     │
         │  via SSE (chunks)    │
         └──────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐    ┌──────────────────┐
│  Frontend     │    │  Save assistant  │
│  displays     │    │  message to DB   │
│  real-time    │    │                  │
└───────────────┘    └──────────────────┘
7. Authentication Flow


JWT Authentication Process

┌──────────────────────────────────────────────────────────┐
│                    SIGNUP FLOW                           │
└──────────────────────────────────────────────────────────┘

User Input: email + password
     │
     ▼
Frontend Validation
     │
     ▼
POST /api/auth/signup
     │
     ▼
Backend: Check if email exists
     │
     ├─► Email exists? → 400 Error
     │
     └─► Email unique ✓
         │
         ▼
    Hash password (Argon2)
         │
         ▼
    Create user in database
         │
         ▼
    Generate JWT token
         │
         ▼
    Return {access_token, token_type}
         │
         ▼
    Frontend stores token in localStorage
         │
         ▼
    Axios interceptor adds token to all requests
         │
         ▼
    User authenticated ✓

┌──────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                            │
└──────────────────────────────────────────────────────────┘

User Input: email + password
     │
     ▼
POST /api/auth/login
     │
     ▼
Backend: Find user by email
     │
     ├─► Not found? → 401 Error
     │
     └─► User found ✓
         │
         ▼
    Verify password (Argon2)
         │
         ├─► Invalid? → 401 Error
         │
         └─► Valid ✓
             │
             ▼
        Generate JWT token
             │
             ▼
        Return {access_token, token_type}
             │
             ▼
        Frontend stores token
             │
             ▼
        User authenticated ✓

┌──────────────────────────────────────────────────────────┐
│                 PROTECTED REQUEST                        │
└──────────────────────────────────────────────────────────┘

Frontend makes API request
     │
     ▼
Axios interceptor adds:
  Authorization: Bearer <token>
     │
     ▼
Backend JWT middleware
     │
     ▼
Decode & verify token
     │
     ├─► Invalid/Expired? → 401 Error
     │
     └─► Valid ✓
         │
         ▼
    Extract user_id from token
         │
         ▼
    Attach user to request
         │
         ▼
    Process request ✓





8. Chat Flow (Detailed)
Streaming Response Architecture
text
┌──────────────────────────────────────────────────────────┐
│           FRONTEND: User Types Message                   │
└──────────────────────────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  ChatWindow.jsx        │
         │  handleSend()          │
         └──────────┬─────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │  threadService.js      │
         │  streamChat()          │
         └──────────┬─────────────┘
                    │
                    ▼ HTTP POST + SSE
┌──────────────────────────────────────────────────────────┐
│           BACKEND: FastAPI Receives Request              │
└──────────────────────────────────────────────────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │  /api/chat/stream      │
         │  chat.py endpoint      │
         └──────────┬─────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌───────────────┐    ┌─────────────────┐
│  Get thread   │    │  Save user      │
│  history      │    │  message to DB  │
│  (last 10)    │    │                 │
└───────┬───────┘    └────────┬────────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │  ChatService.py      │
         │  stream_response()   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Build messages:     │
         │  1. System prompt    │
         │  2. Conversation     │
         │     history          │
         │  3. User message     │
         └──────────┬───────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              ChatGroq API (Groq Cloud)                   │
└──────────────────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  LLaMA 3.3 70B       │
         │  Process request     │
         │  Generate response   │
         └──────────┬───────────┘
                    │
                    ▼ Async Generator
         ┌──────────────────────┐
         │  Stream chunks       │
         │  "Diabetes "         │
         │  "symptoms "         │
         │  "include: "         │
         │  ...                 │
         └──────────┬───────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│          BACKEND: Process Stream                         │
└──────────────────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │  async for chunk    │
         │  in llm.astream()   │
         └──────────┬──────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌────────────────┐   ┌─────────────────┐
│  Yield SSE     │   │  Accumulate     │
│  data: {       │   │  full response  │
│    "content":  │   │  for saving     │
│    "chunk"     │   │                 │
│  }             │   │                 │
└────────┬───────┘   └────────┬────────┘
         │                    │
         │                    ▼
         │          ┌──────────────────┐
         │          │  Save assistant  │
         │          │  message to DB   │
         │          └──────────────────┘
         │
         ▼ SSE Stream
┌──────────────────────────────────────────────────────────┐
│          FRONTEND: Receive & Display                     │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────┐
│  StreamingMessage.jsx│
│  Displays chunks in  │
│  real-time with      │
│  typing animation    │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │  Complete!   │
    │  Final msg   │
    │  shown in    │
    │  MessageList │
    └──────────────┘


9. State Management


React State Flow

┌─────────────────────────────────────────────────────┐
│                  App.js (Root)                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  State:                                             │
│  - showLogin: boolean                               │
│  - showSignup: boolean                              │
│  - currentThreadId: number | null                   │
│                                                     │
│  Methods:                                           │
│  - handleNewThread()                                │
│  - handleThreadSelect(id)                           │
│  - handleThreadCreated(id)                          │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│ AuthContext   │    │   Sidebar      │
│               │    │                │
│ State:        │    │ State:         │
│ - user        │    │ - threads[]    │
│ - token       │    │ - loading      │
│ - loading     │    │                │
│               │    │ Methods:       │
│ Methods:      │    │ - loadThreads()│
│ - login()     │    │ - handleUpdate │
│ - signup()    │    │ - handleDelete │
│ - logout()    │    │                │
│ - isAuth()    │    │                │
└───────────────┘    └────────┬───────┘
                              │
                              ▼
                     ┌────────────────┐
                     │  ChatWindow    │
                     │                │
                     │ State:         │
                     │ - messages[]   │
                     │ - input        │
                     │ - loading      │
                     │ - streaming    │
                     │ - streamingMsg │
                     │                │
                     │ Methods:       │
                     │ - handleSend() │
                     │ - loadMessages │
                     └────────────────┘
10. Performance Optimizations


Backend Optimizations


# 1. WAL Mode for SQLite
PRAGMA journal_mode=WAL;          # Multiple readers + 1 writer
PRAGMA synchronous=NORMAL;        # Faster writes
PRAGMA busy_timeout=5000;         # Wait for locks
PRAGMA cache_size=-64000;         # 64MB cache
PRAGMA temp_store=MEMORY;         # RAM for temp data

# 2. Connection Pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # 20 persistent connections
    max_overflow=30,           # 30 additional connections
    pool_pre_ping=True,        # Verify before use
    pool_recycle=3600,         # Recycle after 1 hour
)

# 3. Multiple Uvicorn Workers
uvicorn app.main:app --workers 4  # 4 processes

# 4. Async Database Operations
await asyncio.to_thread(
    MemoryService.save_message,
    db, thread_id, "user", message
)



11. Security Measures


Authentication Security

1. Password Hashing
    Argon2 (memory-hard, resistant to GPU attacks)
   Automatic salting
    Configurable cost parameters

2. JWT Security
    HS256 algorithm
   Secret key from environment
   Expiration time (30 minutes)
   Token verification on every request

3. CORS Protection
   Explicit origin whitelist
   Credentials allowed
    Specific methods only

4. SQL Injection Prevention
   SQLAlchemy ORM (parameterized queries)
    No raw SQL execution

5. Input Validation
   Pydantic schemas
   Type checking
   Length constraints

6. Rate Limiting
    Can be added with slowapi
    Per-IP or per-user limits


Data Protection

1. Sensitive Data
   Passwords: Hashed (Argon2)
   JWT Secret: Environment variable
   API Keys: Environment variable
    Database: .gitignore

2. HTTPS in Production
    SSL/TLS certificates
    Automatic redirect from HTTP

3. Environment Variables
   .env file 
   Deployment platform secrets

4. Database Backups
    Automated daily backups
    Point-in-time recovery 


Performance Benchmarks
Expected Performance (100 Concurrent Users)
Metric	Value
Average Response Time	< 500ms
95th Percentile	< 2000ms
Streaming Latency	< 100ms per chunk
Database Queries	< 50ms
Concurrent Connections	100-150
Throughput	50-100 req/sec
Memory Usage	512MB - 1GB
CPU Usage	20-40% (4 cores)
