<<<<<<< HEAD
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
=======
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
>>>>>>> 2b90058878e36dd5e29c9c8d4eb7ea0df45f5dec
