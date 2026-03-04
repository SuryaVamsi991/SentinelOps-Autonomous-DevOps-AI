"""
SentinelOps Project Configuration
Author: Arsh Verma
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/sentinelops"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    
    # GitHub
    GITHUB_TOKEN: str = ""
    GITHUB_WEBHOOK_SECRET: str = "sentinelops_secret"
    
    # App
    SECRET_KEY: str = "sentinelops_dev_key"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["*"]
    FRONTEND_URL: str = "http://localhost:3000"
    
    # ML Model
    MODEL_PATH: str = "app/ml/model.pkl"
    
    @property
    def is_prod(self) -> bool:
        return not self.DEBUG

    def validate_keys(self):
        if self.is_prod:
            if not self.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY must be set in production")
            if not self.GITHUB_TOKEN:
                raise ValueError("GITHUB_TOKEN must be set in production")
    
    class Config:
        env_file = ".env"

settings = Settings()
