"""
11번가 스크래퍼
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


class ElevenstScraper(BaseScraper):
    """11번가 검색 스크래퍼"""

    SEARCH_URL = "https://search.11st.co.kr/Search.tmall"

    async def search(self, keyword: str) -> List[SearchResultItem]:
        """11번가 검색"""
        try:
            # 검색 페이지 이동
            url = f"{self.SEARCH_URL}?kwd={quote_plus(keyword)}"
            self.driver.get(url)

            # 상품 리스트 로딩 대기
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "li.c-search-list__item, div.c_card_list"))
            )

            time.sleep(2)

            # BeautifulSoup으로 파싱
            soup = BeautifulSoup(self.driver.page_source, "lxml")
            products = soup.select("li.c-search-list__item")
            if not products:
                products = soup.select("div.c_card")

            # 악세서리 필터링 제외 키워드 목록
            exclusion_keywords = ["케이스", "필름", "보호필름", "파우치", "스트랩", "실리콘", "단품", "충전기", "어댑터", "스킨", "커버", "거치대"]
            # 사용자가 명시적으로 검색한 단어는 제외 목록에서 뺌 (예: "에어팟 케이스" 검색 시 "케이스"는 필터링 안 함)
            active_exclusions = [ex for ex in exclusion_keywords if ex not in keyword]

            results = []
            for idx, product in enumerate(products):
                if len(results) >= 5:
                    break

                try:
                    import json
                    
                    # 상품 ID (JSON 덤프에서 추출)
                    product_id = ""
                    anchor = product.select_one("a.c-card-item__anchor")
                    if anchor and anchor.get("data-log-body"):
                        try:
                            data = json.loads(anchor.get("data-log-body"))
                            product_id = data.get("content_no", "")
                        except: pass
                    
                    if not product_id:
                        product_id = product.get("data-productno", f"elevenst_{int(time.time())}_{idx}")

                    # 상품명
                    name_elem = product.select_one("div.c-card-item__name dd")
                    if not name_elem:
                        name_elem = product.select_one("span.sr-only")
                    if not name_elem:
                        name_elem = product.select_one("div.c_prd_name a")
                        
                    name = name_elem.get_text(strip=True) if name_elem else ""

                    # 악세서리 찌꺼기 능동 필터링 적용
                    is_excluded = False
                    for ex in active_exclusions:
                        if ex in name:
                            is_excluded = True
                            break
                    
                    if is_excluded:
                        continue # 이 상품(악세서리)은 건너뛰고 다음 분석

                    # 가격
                    price_elem = product.select_one("dd.c-card-item__price span.value")
                    if not price_elem:
                        price_elem = product.select_one("span.c_prd_price strong")
                        
                    price = self._parse_price(price_elem.get_text() if price_elem else "0")

                    # 이미지
                    img_elem = product.select_one("img")
                    image_url = img_elem.get("src", "") if img_elem else ""

                    # URL
                    link_elem = product.select_one("a.c-card-item__anchor")
                    if not link_elem:
                        link_elem = product.select_one("a.c_prd_link")
                        
                    product_url = link_elem.get("href", "") if link_elem else ""
                    if product_url and not product_url.startswith("http"):
                        product_url = "https:" + product_url

                    # 배송비 (기본 무료)
                    shipping_fee = 0

                    results.append(SearchResultItem(
                        productId=product_id,
                        name=name,
                        price=price,
                        imageUrl=image_url,
                        url=product_url,
                        mall="elevenst",
                        shippingFee=shipping_fee
                    ))

                except Exception as e:
                    print(f"11번가 상품 파싱 오류: {e}")
                    continue

            return results

        except Exception as e:
            print(f"11번가 검색 오류: {e}")
            return []
