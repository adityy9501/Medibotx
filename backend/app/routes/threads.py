from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..auth.jwt_handler import verify_token
from ..services.user_service import UserService

router = APIRouter(prefix="/api/threads", tags=["Threads"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        return None
    
    try:
        token = authorization.split(" ")[1]  
        token_data = verify_token(token)
        if not token_data:
            return None
        user = UserService.get_user_by_email(db, token_data.email)
        return user
    except:
        return None

@router.post("/", response_model=schemas.ThreadResponse)
def create_thread(
    thread: schemas.ThreadCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
   
    new_thread = models.Thread(
        user_id=current_user.id if current_user else None,
        title=thread.title,
        is_guest=thread.is_guest
    )
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

@router.get("/", response_model=List[schemas.ThreadResponse])
def get_threads(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    if not current_user:
        return []
    
    threads = db.query(models.Thread).filter(
        models.Thread.user_id == current_user.id
    ).order_by(models.Thread.updated_at.desc()).all()
    
    return threads

@router.get("/{thread_id}", response_model=schemas.ThreadResponse)
def get_thread(thread_id: int, db: Session = Depends(get_db)):
 
    thread = db.query(models.Thread).filter(models.Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread

@router.delete("/{thread_id}")
def delete_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    
    thread = db.query(models.Thread).filter(models.Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Check ownership
    if thread.user_id and current_user and thread.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(thread)
    db.commit()
    return {"message": "Thread deleted successfully"}

@router.get("/{thread_id}/messages", response_model=List[schemas.MessageResponse])
def get_thread_messages(thread_id: int, db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter(
        models.Message.thread_id == thread_id
    ).order_by(models.Message.created_at).all()
    
    return messages
# new
@router.put("/{thread_id}", response_model=schemas.ThreadResponse)
def update_thread(
    thread_id: int,
    title: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
  
    thread = db.query(models.Thread).filter(models.Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Check ownership
    if thread.user_id and current_user and thread.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    thread.title = title
    db.commit()
    db.refresh(thread)
    return thread
