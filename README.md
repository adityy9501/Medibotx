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


2. Architecture 

   
    Step 1: User Input (CLIENT LAYER)
    
      User types message → MessageInput component → ChatWindow.handleSend()
    
    Step 2: Create/Select Thread (API GATEWAY)
        
      POST /api/threads/ → ThreadService creates new conversation
        Returns thread_id = 5
        
    Step 3: Send Message (CLIENT → BACKEND)
    
     POST /api/chat/stream
        
     Body:  {thread_id: 5, message: "What are symptoms of diabetes?"}
        Headers: Authorization: Bearer <JWT token>
        
    Step 4: Backend Processing (SERVICE LAYER)
    
     chat.py endpoint receives request
        ↓
        Verify JWT token
        ↓
        MemoryService.save_message(thread_id=5, role="user", message)
        ↓
        MemoryService.get_conversation_history(thread_id=5, limit=10)
        ↓
        ChatService.stream_response(message, history)
        
    Step 5: Build Message Array
    
    
    messages = [
          {role: "system", content: "Medical system prompt..."},
          {role: "user", content: "Previous question..."},
          {role: "assistant", content: "Previous answer..."},
          {role: "user", content: "What are symptoms of diabetes?"}
        ]
        
    
    Step 6: Call AI (EXTERNAL SERVICES)
    
     ChatGroq API receives messages
        ↓
        LLaMA 3.3 70B processes request
        ↓
        Generates response in chunks (streaming):
          "Diabetes " → "symptoms " → "include " → "increased " → "thirst..."
        
      
    Step 7: Stream to Frontend (SERVICE → CLIENT)
    
        
      Backend formats as Server-Sent Events (SSE):
        data: {"content": "Diabetes "}
        data: {"content": "symptoms "}
        data: {"content": "include "}
        ...
        data: {"done": true}
        
    
    Step 8: Display Real-Time (CLIENT LAYER)
    
     StreamingMessage.jsx receives chunks
        ↓
        Displays 
        ↓
        Shows typing cursor blinking
        ↓
        Accumulates full response
        
    Step 9: Save Complete Response (DATA LAYER)
    
    
     MemoryService.save_message(
          thread_id=5, 
          role="assistant", 
          content="Complete diabetes symptoms answer..."
        )
    
    Step 10: UI Update (CLIENT LAYER)
    
    
      Remove StreamingMessage component
        ↓
        Add MessageItem component with full response
        ↓
        Update thread's updated_at timestamp


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
   
    Table 1: users (User Accounts)
    Purpose:
    Stores registered user accounts and authentication information.
    
    Fields:
    id (PK) - Primary Key, unique identifier for each user (auto-increments: 1, 2, 3...)
    
    email (UNIQUE) - User's email address (must be unique, no duplicates)
    
    hashed_password - Password encrypted with Argon2 (never stored as plain text)
    
    is_active - Boolean flag (true/false) to enable/disable accounts
    
    created_at - Timestamp when account was created



    Table 2: threads (Conversations)
    Purpose:
    Stores conversation threads - each represents one chat session.
    
    Fields:
    id (PK) - Primary Key, unique thread identifier
    
    user_id (FK) - Foreign Key linking to users table (who owns this conversation)
    
    title - Thread name (e.g., "Diabetes Questions", "Blood Pressure Help")
    
    is_guest - Boolean flag indicating if this is a guest conversation (no user account)
    
    created_at - When the conversation started
    
    updated_at - Last message timestamp (updates automatically)


    Table 3: messages (Chat Messages)
    Purpose:
    Stores individual messages within conversations (both user and AI responses).
    
    Fields:
    id (PK) - Primary Key, unique message identifier
    
    thread_id (FK) - Foreign Key linking to threads table (which conversation)
    
    role - Who sent the message: "user" or "assistant"
    
    content - The actual message text (TEXT type, can be very long)
    
    created_at - Exact timestamp when message was sent



    
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

    1. User Access
       Landing Page → Guest/Login choice → Authentication → Main interface
    
    2. Conversation Management  
       Click "New" → Create thread → Get thread_id → Store in state
    
    3. Chat Interaction (Repeating Loop)
       Type message → Send to backend → Save user msg → Get history
       → Build AI request → Call Groq → Stream chunks → Display real-time
       → Save AI response → Update UI → Ready for next message
    
    The cycle repeats from Step 3 onwards for every user message




7. Authentication Flow


JWT Authentication Process


User fills signup form
    ↓
POST /api/auth/signup
    ↓
Backend hashes password (Argon2)
    ↓
Save to users table
    ↓
Generate JWT token
    ↓
Return {access_token: "eyJhbGc..."}
    ↓
Frontend stores in localStorage
    ↓
Add to all requests: Authorization: Bearer <token>
    ↓
User authenticated 



8. Chat Flow (Detailed)


Streaming Response Architecture
Step 1: User types message
    ↓
Step 2: POST /api/chat/stream {thread_id, message}
    ↓
Step 3a: Save user message to DB
Step 3b: Get conversation history (parallel)
    ↓
Step 4: Build message array
         [System Prompt, History, User Message]
    ↓
Step 5: Call ChatGroq API
    ↓
Step 6: LLaMA 3.3 70B generates response
    ↓
Step 7: Stream chunks via SSE
         data: {"content": "Diabetes "}
         data: {"content": "symptoms "}
         data: {"content": "include..."}
    ↓
Step 8: Frontend displays real-time 
    ↓
Step 9: Save complete AI response to DB
    ↓
Step 10: Update UI with final message




9. State Management


App.js
  → currentThreadId: number
  → showLogin: boolean
  → showSignup: boolean

AuthContext
  → user: {id, email}
  → token: string
  → isAuthenticated: boolean
  → login(), signup(), logout()

Sidebar
  → threads: Array<Thread>
  → loading: boolean
  → loadThreads(), handleUpdate(), handleDelete()

ChatWindow
  → messages: Array<Message>
  → input: string
  → loading: boolean
  → streaming: boolean
  → streamingMessage: string
  → handleSend(), loadMessages()


  
10. Performance Optimizations


Backend Optimizations


 1. WAL Mode for SQLite
PRAGMA journal_mode=WAL;          # Multiple readers + 1 writer
PRAGMA synchronous=NORMAL;        # Faster writes
PRAGMA busy_timeout=5000;         # Wait for locks
PRAGMA cache_size=-64000;         # 64MB cache
PRAGMA temp_store=MEMORY;         # RAM for temp data

2. Connection Pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # 20 persistent connections
    max_overflow=30,           # 30 additional connections
    pool_pre_ping=True,        # Verify before use
    pool_recycle=3600,         # Recycle after 1 hour
)

 3. Multiple Uvicorn Workers
uvicorn app.main:app --workers 4  # 4 processes

 4. Async Database Operations
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
