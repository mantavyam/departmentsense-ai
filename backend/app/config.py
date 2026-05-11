from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "dev"
    database_url: str = "sqlite+aiosqlite:///./departmentsense.db"
    secret_key: str = "change-me-in-prod-please"
    frontend_origin: str = "http://localhost:3000"

    hf_api_token: str = ""
    hf_classifier_model: str = "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"
    hf_sentiment_model: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    use_local_ml: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
