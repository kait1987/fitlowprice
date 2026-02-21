"""
네이버쇼핑 스크래퍼
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


class NaverScraper(BaseScraper):
    """네이버쇼핑 검색 스크래퍼"""

    SEARCH_URL = "https://search.shopping.naver.com/search/all"

    async def search(self, keyword: str) -> List[SearchResultItem]:
        """네이버쇼핑 검색"""
        try:
            # 검색 페이지 이동
            url = f"{self.SEARCH_URL}?query={quote_plus(keyword)}"
            self.driver.get(url)

            # 상품 리스트 로딩 대기
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.product_list_area"))
            )

            time.sleep(2)

            # BeautifulSoup으로 파싱
            soup = BeautifulSoup(self.driver.page_source, "lxml")
            products = soup.select("div.product_item")[:5]

            results = []
            for idx, product in enumerate(products):
                try:
                    # 상품 ID (네이버는 고유 ID가 없어 인덱스 사용)
                    product_id = f"naver_{int(time.time())}_{idx}"

                    # 상품명
                    name_elem = product.select_one("div.product_title a")
                    name = name_elem.get_text(strip=True) if name_elem else ""

                    # 가격
                    price_elem = product.select_one("span.price_num strong")
                    price = self._parse_price(price_elem.get_text() if price_elem else "0")

                    # 이미지
                    img_elem = product.select_one("img.product_img")
                    image_url = img_elem.get("src", "") if img_elem else ""

                    # URL
                    link_elem = product.select_one("a.product_link")
                    product_url = link_elem.get("href", "") if link_elem else ""

                    # 배송비 (기본 무료)
                    shipping_fee = 0

                    results.append(SearchResultItem(
                        productId=product_id,
                        name=name,
                        price=price,
                        imageUrl=image_url,
                        url=product_url,
                        mall="naver",
                        shippingFee=shipping_fee
                    ))

                except Exception as e:
                    print(f"네이버 상품 파싱 오류: {e}")
                    continue

            return results

        except Exception as e:
            print(f"네이버 검색 오류: {e}")
            return []
