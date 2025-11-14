from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, chat, threads
from .config import get_settings

settings = get_settings()


Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      
        "http://localhost:5173",      
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],              
    allow_headers=["*"],              
    expose_headers=["*"],             
)


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(threads.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running"
    }


