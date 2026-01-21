import { MallScraper, ScraperResult, SearchResultItem } from "./types";

const COUPANG_SEARCH_URL = "https://www.coupang.com/np/search";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * 쿠팡 검색 결과 파싱을 위한 유틸리티 함수
 */
function parsePrice(priceText: string): number {
  return parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
}

function extractProductId(url: string): string | null {
  const match = url.match(/products\/(\d+)/);
  return match ? match[1] : null;
}

export const CoupangScraper: MallScraper = {
  name: "coupang",

  matchUrl(url: string) {
    return url.includes("coupang.com");
  },

  async scrape(url: string): Promise<ScraperResult> {
    console.log(`Scraping Coupang: ${url}`);

    // TODO: 단일 상품 상세 페이지 크롤링 구현
    return {
      success: true,
      product: {
        name: "Mock Product from Coupang",
        imageUrl: "https://dummyimage.com/400x400/orange/white&text=Coupang",
      },
      price: {
        mallName: "coupang",
        basePrice: 10000,
        shippingFee: 0,
        productUrl: url,
      },
    };
  },

  /**
   * 쿠팡 검색 API를 통한 상품 검색
   * 쿠팡은 공식 API가 없으므로 검색 페이지 HTML을 파싱합니다.
   * 개발 환경에서 차단될 경우 Mock 데이터를 반환합니다.
   */
  async search(keyword: string): Promise<SearchResultItem[]> {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const searchUrl = `${COUPANG_SEARCH_URL}?q=${encodedKeyword}&channel=user`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        console.error(`Coupang search failed: ${response.status}`);
        // 개발 환경에서 차단 시 Mock 데이터 반환
        if (process.env.NODE_ENV === "development") {
          return getMockCoupangResults(keyword);
        }
        return [];
      }

      const html = await response.text();
      const results = parseCoupangSearchResults(html);

      // 파싱 결과가 없으면 Mock 데이터 반환 (개발 환경)
      if (results.length === 0 && process.env.NODE_ENV === "development") {
        return getMockCoupangResults(keyword);
      }

      return results;
    } catch (error) {
      console.error("Coupang search error:", error);
      // 개발 환경에서 에러 시 Mock 데이터 반환
      if (process.env.NODE_ENV === "development") {
        return getMockCoupangResults(keyword);
      }
      return [];
    }
  },
};

/**
 * 쿠팡 검색 결과 HTML 파싱
 *
 * 쿠팡 검색 결과 HTML 구조 (2026년 1월 기준):
 * - ul#productList > li.search-product (각 상품)
 *   - a.search-product-link (상품 링크)
 *   - img.search-product-wrap-img (이미지)
 *   - div.name (상품명)
 *   - strong.price-value (가격)
 *   - span.base-price (원가 - 할인 시)
 *   - span.rocket-icon (로켓배송 아이콘)
 *   - em.rating (평점)
 *   - span.rating-total-count (리뷰 수)
 */
function parseCoupangSearchResults(html: string): SearchResultItem[] {
  const results: SearchResultItem[] = [];

  // Regex 기반 파싱 (서버 환경에서 DOM 파서 없이 동작)
  // 상품 블록 추출: <li class="search-product" ...> ~ </li>
  const productRegex =
    /<li[^>]*class="[^"]*search-product[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  const productMatches = html.matchAll(productRegex);

  for (const match of productMatches) {
    const productHtml = match[1];

    // 상품 링크 추출
    const linkMatch = productHtml.match(
      /<a[^>]*href="([^"]*)"[^>]*class="[^"]*search-product-link[^"]*"/i,
    );
    if (!linkMatch) continue;
    const productUrl = `https://www.coupang.com${linkMatch[1]}`;

    // 상품명 추출
    const nameMatch = productHtml.match(
      /<div[^>]*class="[^"]*name[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    );
    const productName = nameMatch
      ? nameMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    // 가격 추출
    const priceMatch = productHtml.match(
      /<strong[^>]*class="[^"]*price-value[^"]*"[^>]*>([\s\S]*?)<\/strong>/i,
    );
    const price = priceMatch ? parsePrice(priceMatch[1]) : 0;

    // 원가 추출 (할인 상품인 경우)
    const originalPriceMatch = productHtml.match(
      /<span[^>]*class="[^"]*base-price[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
    );
    const originalPrice = originalPriceMatch
      ? parsePrice(originalPriceMatch[1])
      : undefined;

    // 이미지 추출
    const imageMatch = productHtml.match(
      /<img[^>]*(?:data-img-src|src)="([^"]+)"[^>]*class="[^"]*search-product-wrap-img[^"]*"/i,
    );
    const imageUrl = imageMatch ? imageMatch[1] : "";

    // 로켓배송 여부
    const isRocketDelivery = /rocket-icon|rocket_logo|로켓배송/i.test(
      productHtml,
    );

    // 무료배송 여부
    const isFreeShipping = /free-shipping|무료배송/i.test(productHtml);

    // 평점 추출
    const ratingMatch = productHtml.match(
      /<em[^>]*class="[^"]*rating[^"]*"[^>]*>([\d.]+)<\/em>/i,
    );
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

    // 리뷰 수 추출
    const reviewMatch = productHtml.match(
      /<span[^>]*class="[^"]*rating-total-count[^"]*"[^>]*>\((\d+)\)<\/span>/i,
    );
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1], 10) : undefined;

    // 유효한 데이터만 추가
    if (productName && price > 0) {
      results.push({
        productName,
        price,
        originalPrice,
        imageUrl: imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl,
        productUrl,
        mallName: "coupang",
        isRocketDelivery,
        isFreeShipping,
        rating,
        reviewCount,
      });
    }

    // 상위 5개만 반환 (MVP)
    if (results.length >= 5) break;
  }

  return results;
}

export { extractProductId };

/**
 * 개발 환경용 Mock 데이터 생성 함수
 * 쿠팡 크롤링이 차단될 경우 테스트용 데이터를 반환합니다.
 */
function getMockCoupangResults(keyword: string): SearchResultItem[] {
  return [
    {
      productName: `[쿠팡] ${keyword} 추천 상품 1`,
      price: 29900,
      originalPrice: 39900,
      imageUrl: "https://placehold.co/300x300/FF6600/FFFFFF?text=Coupang",
      productUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
      mallName: "coupang",
      isRocketDelivery: true,
      isFreeShipping: true,
      rating: 4.8,
      reviewCount: 1523,
    },
    {
      productName: `[쿠팡] ${keyword} 인기 상품 2`,
      price: 35000,
      originalPrice: 45000,
      imageUrl: "https://placehold.co/300x300/FF6600/FFFFFF?text=Coupang",
      productUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
      mallName: "coupang",
      isRocketDelivery: true,
      isFreeShipping: true,
      rating: 4.5,
      reviewCount: 892,
    },
    {
      productName: `[쿠팡] ${keyword} 베스트 상품 3`,
      price: 42500,
      imageUrl: "https://placehold.co/300x300/FF6600/FFFFFF?text=Coupang",
      productUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
      mallName: "coupang",
      isRocketDelivery: false,
      isFreeShipping: false,
      rating: 4.3,
      reviewCount: 456,
    },
  ];
}
