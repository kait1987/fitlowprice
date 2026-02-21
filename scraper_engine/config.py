"""
환경 설정 관리
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"

# Chrome Profile
BASE_DIR = Path(__file__).parent
CHROME_PROFILE_PATH = os.getenv(
    "CHROME_PROFILE_PATH",
    str(BASE_DIR / "chrome_profile")
)

# Selenium Config
IMPLICIT_WAIT = 10  # seconds
PAGE_LOAD_TIMEOUT = 30  # seconds
