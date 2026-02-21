"""
쿠팡 스크래퍼
"""
import time
from typing import List
from urllib.parse import quote_plus
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from models.schemas import SearchResultItem
from .base import BaseScraper


class CoupangScraper(BaseScraper):
    """쿠팡 검색 스크래퍼"""

    SEARCH_URL = "https://www.coupang.com/np/search"

    async def search(self, keyword: str) -> List[SearchResultItem]:
        """쿠팡 검색"""
        try:
            # 검색 페이지 이동
            url = f"{self.SEARCH_URL}?q={quote_plus(keyword)}"
            self.driver.get(url)

            # 페이지 로딩 대기 (WebDriverWait 대신 sleep 사용 - 안정성 향상)
            time.sleep(5)  # 동적 콘텐츠 로딩 대기

            # BeautifulSoup으로 파싱
            soup = BeautifulSoup(self.driver.page_source, "lxml")

            # 디버깅: 페이지 제목 확인
            title = self.driver.title
            print(f"Page title: {title}")

            # 새로운 CSS 클래스 사용 (ProductUnit_productUnit로 시작하는 클래스)
            products = soup.select("li[class*='ProductUnit_productUnit']")[:5]  # 상위 5개
            print(f"Found {len(products)} product elements")

            results = []
            for product in products:
                try:
                    # 상품 ID (data-id 속성 사용)
                    product_id = product.get("data-id", "")
                    if not product_id:
                        continue

                    # 상품명 (새로운 클래스 이름)
                    name_elem = product.select_one("[class*='ProductUnit_productNameV2']")
                    if not name_elem:
                        name_elem = product.select_one(".productTitle")
                    name = name_elem.get_text(strip=True) if name_elem else ""

                    # 가격 (여러 패턴 시도)
                    price = 0
                    price_elem = product.select_one("strong.price-value")
                    if price_elem:
                        price = self._parse_price(price_elem.get_text())

                    # 이미지
                    img_elem = product.select_one("img")
                    image_url = ""
                    if img_elem:
                        image_url = img_elem.get("src", "") or img_elem.get("data-img-src", "")

                    # URL
                    link_elem = product.select_one("a")
                    product_url = ""
                    if link_elem:
                        href = link_elem.get("href", "")
                        product_url = f"https://www.coupang.com{href}" if href.startswith("/") else href

                    # 배송비 (기본 무료)
                    shipping_fee = 0

                    results.append(SearchResultItem(
                        productId=product_id,
                        name=name,
                        price=price,
                        imageUrl=image_url,
                        url=product_url,
                        mall="coupang",
                        shippingFee=shipping_fee
                    ))

                except Exception as e:
                    print(f"쿠팡 상품 파싱 오류: {e}")
                    continue

            return results

        except Exception as e:
            print(f"쿠팡 검색 오류: {e}")
            return []
