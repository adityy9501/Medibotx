from sqlalchemy.orm import Session
from .. import models, schemas
from ..auth.password import hash_password, verify_password

class UserService:
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate) -> models.User:
        hashed_pw = hash_password(user.password)
        db_user = models.User(
            email=user.email,
            hashed_password=hashed_pw
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> models.User:
        return db.query(models.User).filter(models.User.email == email).first()
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> models.User:
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
