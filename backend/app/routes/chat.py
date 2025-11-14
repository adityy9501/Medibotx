from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import ChatRequest
from ..services.chat_service import ChatService
from ..services.memory_service import MemoryService
import json
import asyncio

router = APIRouter(prefix="/api/chat", tags=["Chat"])
chat_service = ChatService()

@router.post("/stream")
async def stream_chat(request: ChatRequest, db: Session = Depends(get_db)):
    
    history = await asyncio.to_thread(
        MemoryService.get_conversation_history, 
        db, 
        request.thread_id, 
        limit=10
    )
    
    await asyncio.to_thread(
        MemoryService.save_message, 
        db, 
        request.thread_id, 
        "user", 
        request.message
    )
    
    
    async def event_generator():
        full_response = ""
        try:
            async for chunk in chat_service.stream_response(request.message, history):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            await asyncio.to_thread(
                MemoryService.save_message, 
                db, 
                request.thread_id, 
                "assistant", 
                full_response
            )
            await asyncio.to_thread(
                MemoryService.update_thread_timestamp, 
                db, 
                request.thread_id
            )
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )










# from fastapi import APIRouter, Depends, HTTPException
# from fastapi.responses import StreamingResponse
# from sqlalchemy.orm import Session
# from ..database import get_db
# from ..schemas import ChatRequest
# from ..services.chat_service import ChatService
# from ..services.memory_service import MemoryService
# import json

# router = APIRouter(prefix="/api/chat", tags=["Chat"])
# chat_service = ChatService()

# @router.post("/stream")
# async def stream_chat(request: ChatRequest, db: Session = Depends(get_db)):
    
    
#     history = MemoryService.get_conversation_history(db, request.thread_id, limit=10)

#     MemoryService.save_message(db, request.thread_id, "user", request.message)
    
#     async def event_generator():
#         full_response = ""
#         try:
#             async for chunk in chat_service.stream_response(request.message, history):
#                 full_response += chunk
#                 # SSE format: data: {content}\n\n
#                 yield f"data: {json.dumps({'content': chunk})}\n\n"
#             MemoryService.save_message(db, request.thread_id, "assistant", full_response)
#             MemoryService.update_thread_timestamp(db, request.thread_id)            
#             yield f"data: {json.dumps({'done': True})}\n\n"
            
#         except Exception as e:
#             yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
#     return StreamingResponse(
#         event_generator(),
#         media_type="text/event-stream",
#         headers={
#             "Cache-Control": "no-cache",
#             "Connection": "keep-alive",
#             "X-Accel-Buffering": "no"  
#         }
#     )
