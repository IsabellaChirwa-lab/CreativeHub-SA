from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://creativehub:creativehub_dev_pw@localhost:5432/creativehub"
    secret_key: str = "dev_secret_change_me"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
