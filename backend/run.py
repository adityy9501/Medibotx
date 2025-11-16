import uvicorn
import multiprocessing

if __name__ == "__main__":
    
    workers = multiprocessing.cpu_count()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8007,
        reload=False, 
        workers=workers  
    )
