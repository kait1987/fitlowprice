"""
기본 스크래퍼 추상 클래스
"""
from abc import ABC, abstractmethod
from typing import List
from selenium.webdriver.remote.webdriver import WebDriver
from models.schemas import SearchResultItem


class BaseScraper(ABC):
    """스크래퍼 기본 클래스"""

    def __init__(self, driver: WebDriver):
        self.driver = driver

    @abstractmethod
    async def search(self, keyword: str) -> List[SearchResultItem]:
        """
        검색 수행 (추상 메서드)

        Args:
            keyword: 검색 키워드

        Returns:
            검색 결과 리스트
        """
        pass

    def _safe_get_text(self, element, default: str = "") -> str:
        """안전하게 텍스트 추출"""
        try:
            return element.text.strip() if element else default
        except Exception:
            return default

    def _safe_get_attribute(self, element, attr: str, default: str = "") -> str:
        """안전하게 속성 추출"""
        try:
            return element.get_attribute(attr) or default
        except Exception:
            return default

    def _parse_price(self, price_text: str) -> int:
        """가격 문자열을 정수로 변환"""
        try:
            # "1,234원" -> 1234
            cleaned = ''.join(filter(str.isdigit, price_text))
            return int(cleaned) if cleaned else 0
        except Exception:
            return 0
