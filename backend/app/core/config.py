import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


def _get_bool(value: str | None, default: bool = False) -> bool:
  if value is None:
    return default
  return value.lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
  host: str = os.getenv("HOST", "0.0.0.0")
  port: int = int(os.getenv("PORT", "8000"))
  enable_demo: bool = _get_bool(os.getenv("ENABLE_DEMO"), True)
  demo_fps: int = int(os.getenv("DEMO_FPS", "12"))


settings = Settings()
