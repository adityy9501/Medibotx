from sqlalchemy.orm import Session
from typing import List, Dict
from .. import models

class MemoryService:
    @staticmethod
    def get_conversation_history(db: Session, thread_id: int, limit: int = 10) -> List[Dict]:
        messages = db.query(models.Message).filter(
            models.Message.thread_id == thread_id
        ).order_by(models.Message.created_at.desc()).limit(limit).all()
        
        messages.reverse()
        
        return [
            {
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    
    @staticmethod
    def save_message(db: Session, thread_id: int, role: str, content: str) -> models.Message:
        message = models.Message(
            thread_id=thread_id,
            role=role,
            content=content
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    
    @staticmethod
    def update_thread_timestamp(db: Session, thread_id: int):
        from datetime import datetime
        thread = db.query(models.Thread).filter(models.Thread.id == thread_id).first()
        if thread:
            thread.updated_at = datetime.utcnow()
            db.commit()
