from __future__ import annotations
from app import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Boolean, DateTime, Integer, JSON, ForeignKey


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(String(20), default="free")
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    bio: Mapped[str | None] = mapped_column(String(300))
    location: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    plants: Mapped[list[Plant]] = relationship(back_populates="owner", cascade="all, delete")
    posts: Mapped[list[CommunityPost]] = relationship(back_populates="author")
    usage_logs: Mapped[list[UsageLog]] = relationship(back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "plan": self.plan,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "location": self.location,
            "created_at": self.created_at.isoformat(),
            "plant_count": len(self.plants)
        }


class Plant(db.Model):
    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    nickname: Mapped[str | None] = mapped_column(String(100))
    species: Mapped[str | None] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    location: Mapped[str | None] = mapped_column(String(200))
    watering_frequency: Mapped[str | None] = mapped_column(String(100))
    light_requirement: Mapped[str | None] = mapped_column(String(100))
    health_score: Mapped[int | None] = mapped_column(Integer)
    last_watered: Mapped[datetime | None] = mapped_column(DateTime)
    watering_due: Mapped[bool] = mapped_column(Boolean, default=False)
    acquired_at: Mapped[datetime | None] = mapped_column(DateTime)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped[User] = relationship(back_populates="plants")
    care_logs: Mapped[list[CareLog]] = relationship(back_populates="plant", cascade="all, delete")
    diagnoses: Mapped[list[Diagnosis]] = relationship(back_populates="plant", cascade="all, delete")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "nickname": self.nickname,
            "species": self.species,
            "description": self.description,
            "photo_url": self.photo_url,
            "is_public": self.is_public,
            "location": self.location,
            "watering_frequency": self.watering_frequency,
            "light_requirement": self.light_requirement,
            "health_score": self.health_score,
            "last_watered": self.last_watered.isoformat() if self.last_watered else None,
            "watering_due": self.watering_due,
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "created_at": self.created_at.isoformat()
        }


class Diagnosis(db.Model):
    __tablename__ = "diagnoses"

    id: Mapped[int] = mapped_column(primary_key=True)
    plant_id: Mapped[int | None] = mapped_column(ForeignKey("plants.id"), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str | None] = mapped_column(String(50))
    health_score: Mapped[int | None] = mapped_column(Integer)
    issues_found: Mapped[dict | None] = mapped_column(JSON)
    recommendations: Mapped[dict | None] = mapped_column(JSON)
    care_tips: Mapped[dict | None] = mapped_column(JSON)
    raw_ai_response: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    common_name: Mapped[str | None] = mapped_column(String(200))
    scientific_name: Mapped[str | None] = mapped_column(String(200))
    watering_frequency: Mapped[str | None] = mapped_column(String(100))
    light_requirement: Mapped[str | None] = mapped_column(String(100))

    plant: Mapped[Plant] = relationship(back_populates="diagnoses")

    def serialize(self):
        return {
            "id": self.id,
            "plant_id": self.plant_id,
            "photo_url": self.photo_url,
            "status": self.status,
            "health_score": self.health_score,
            "issues_found": self.issues_found,
            "recommendations": self.recommendations,
            "care_tips": self.care_tips,
            "created_at": self.created_at.isoformat(),
            "common_name": self.common_name,
            "scientific_name": self.scientific_name,
            "watering_frequency": self.watering_frequency,
            "light_requirement": self.light_requirement,
            
        }


class CareLog(db.Model):
    __tablename__ = "care_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id"), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str | None] = mapped_column(String(50))
    notes: Mapped[str | None] = mapped_column(String(500))
    photo_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    plant: Mapped[Plant] = relationship(back_populates="care_logs")

    def serialize(self):
        return {
            "id": self.id,
            "plant_id": self.plant_id,
            "user_id": self.user_id,
            "action": self.action,
            "notes": self.notes,
            "photo_url": self.photo_url,
            "created_at": self.created_at.isoformat()
        }


class CommunityPost(db.Model):
    __tablename__ = "community_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    plant_id: Mapped[int | None] = mapped_column(ForeignKey("plants.id"))
    caption: Mapped[str | None] = mapped_column(String(500))
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    author: Mapped[User] = relationship(back_populates="posts")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plant_id": self.plant_id,
            "caption": self.caption,
            "photo_url": self.photo_url,
            "likes_count": self.likes_count,
            "created_at": self.created_at.isoformat(),
            "author": self.author.username if self.author else None,
            "author_avatar": self.author.avatar_url if self.author else None
        }


class UsageLog(db.Model):
    __tablename__ = "usage_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="usage_logs")

    @staticmethod
    def count_today(user_id: int, action: str) -> int:
        from sqlalchemy import func
        today = datetime.utcnow().date()
        return UsageLog.query.filter(
            UsageLog.user_id == user_id,
            UsageLog.action == action,
            func.date(UsageLog.created_at) == today
        ).count()