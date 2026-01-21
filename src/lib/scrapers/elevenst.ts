import { MallScraper, ScraperResult, SearchResultItem } from "./types";

const ELEVENST_SEARCH_URL = "https://search.11st.co.kr/Search.tmall";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * 가격 문자열을 숫자로 파싱
 */
function parsePrice(priceText: string): number {
  return parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
}

export const ElevenStScraper: MallScraper = {
  name: "elevenst",

  matchUrl(url: string) {
    return url.includes("11st.co.kr");
  },

  async scrape(url: string): Promise<ScraperResult> {
    console.log(`Scraping 11st: ${url}`);

    return {
      success: true,
      product: {
        name: "Mock Product from 11st",
        imageUrl: "https://dummyimage.com/400x400/red/white&text=11st",
      },
      price: {
        mallName: "elevenst",
        basePrice: 11000,
        shippingFee: 0,
        productUrl: url,
      },
    };
  },

  /**
   * 11번가 검색 API를 통한 상품 검색
   * 11번가는 공식 API가 없으므로 검색 페이지 HTML을 파싱합니다.
   * 개발 환경에서 차단될 경우 Mock 데이터를 반환합니다.
   */
  async search(keyword: string): Promise<SearchResultItem[]> {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const searchUrl = `${ELEVENST_SEARCH_URL}?kwd=${encodedKeyword}`;

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
        console.error(`11st search failed: ${response.status}`);
        if (process.env.NODE_ENV === "development") {
          return getMock11stResults(keyword);
        }
        return [];
      }

      const html = await response.text();
      const results = parse11stSearchResults(html);

      if (results.length === 0 && process.env.NODE_ENV === "development") {
        return getMock11stResults(keyword);
      }

      return results;
    } catch (error) {
      console.error("11st search error:", error);
      if (process.env.NODE_ENV === "development") {
        return getMock11stResults(keyword);
      }
      return [];
    }
  },
};

/**
 * 11번가 검색 결과 HTML 파싱
 *
 * 11번가 검색 결과 HTML 구조 (2026년 1월 기준):
 * - ul.c_product_list > li.c_product_item (각 상품)
 *   - a 태그 (상품 링크)
 *   - img.c_product_img (이미지)
 *   - div.c_prd_name (상품명)
 *   - span.c_prd_price > strong (가격)
 *   - del.c_prd_org_price (원가)
 *   - span.c_prd_delivery (배송 정보)
 *   - span.c_prd_review_count (리뷰 수)
 *
 * 또는 새로운 UI:
 * - div.list_product_item (각 상품)
 *   - a.product_link (상품 링크)
 *   - img (이미지)
 *   - .product_name (상품명)
 *   - .product_price (가격)
 */
function parse11stSearchResults(html: string): SearchResultItem[] {
  const results: SearchResultItem[] = [];

  // 패턴 1: 기존 UI (c_product_item)
  const pattern1Regex =
    /<li[^>]*class="[^"]*c_product_item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  // 패턴 2: 새 UI (list_product_item)
  const pattern2Regex =
    /<div[^>]*class="[^"]*list_product_item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  // 패턴 3: 또 다른 UI (상품 카드)
  const pattern3Regex =
    /<div[^>]*class="[^"]*box_pd[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;

  // 모든 패턴 시도
  let productMatches = [...html.matchAll(pattern1Regex)];
  if (productMatches.length === 0) {
    productMatches = [...html.matchAll(pattern2Regex)];
  }
  if (productMatches.length === 0) {
    productMatches = [...html.matchAll(pattern3Regex)];
  }

  for (const match of productMatches) {
    const productHtml = match[1];

    // 상품 링크 추출 (여러 패턴 시도)
    let productUrl = "";
    const linkPatterns = [
      /href="(https?:\/\/[^"]*11st\.co\.kr[^"]*)"/i,
      /href="(\/products\/[^"]*)"/i,
      /data-url="([^"]*)"/i,
    ];

    for (const pattern of linkPatterns) {
      const linkMatch = productHtml.match(pattern);
      if (linkMatch) {
        productUrl = linkMatch[1].startsWith("http")
          ? linkMatch[1]
          : `https://www.11st.co.kr${linkMatch[1]}`;
        break;
      }
    }

    if (!productUrl) continue;

    // 상품명 추출 (여러 패턴 시도)
    let productName = "";
    const namePatterns = [
      /<div[^>]*class="[^"]*c_prd_name[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<p[^>]*class="[^"]*product_name[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
      /<a[^>]*class="[^"]*name[^"]*"[^>]*>([\s\S]*?)<\/a>/i,
      /title="([^"]+)"/i,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = productHtml.match(pattern);
      if (nameMatch) {
        productName = nameMatch[1].replace(/<[^>]+>/g, "").trim();
        if (productName) break;
      }
    }

    // 가격 추출 (여러 패턴 시도)
    let price = 0;
    const pricePatterns = [
      /<strong[^>]*class="[^"]*sale_price[^"]*"[^>]*>([\s\S]*?)<\/strong>/i,
      /<span[^>]*class="[^"]*c_prd_price[^"]*"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>/i,
      /<em[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/em>/i,
      /(\d{1,3}(?:,\d{3})+)원/,
    ];

    for (const pattern of pricePatterns) {
      const priceMatch = productHtml.match(pattern);
      if (priceMatch) {
        price = parsePrice(priceMatch[1]);
        if (price > 0) break;
      }
    }

    // 원가 추출
    const originalPriceMatch = productHtml.match(
      /<del[^>]*class="[^"]*c_prd_org_price[^"]*"[^>]*>([\s\S]*?)<\/del>/i,
    );
    const originalPrice = originalPriceMatch
      ? parsePrice(originalPriceMatch[1])
      : undefined;

    // 이미지 추출
    let imageUrl = "";
    const imagePatterns = [
      /<img[^>]*(?:data-original|data-src|src)="([^"]+)"[^>]*>/i,
      /data-original="([^"]+)"/i,
    ];

    for (const pattern of imagePatterns) {
      const imageMatch = productHtml.match(pattern);
      if (imageMatch) {
        imageUrl = imageMatch[1];
        break;
      }
    }

    // 무료배송 여부
    const isFreeShipping = /무료배송|free/i.test(productHtml);

    // 리뷰 수 추출
    const reviewMatch = productHtml.match(/(?:리뷰|후기)\s*(\d+(?:,\d+)*)/i);
    const reviewCount = reviewMatch
      ? parseInt(reviewMatch[1].replace(/,/g, ""), 10)
      : undefined;

    // 유효한 데이터만 추가
    if (productName && price > 0) {
      results.push({
        productName,
        price,
        originalPrice,
        imageUrl: imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl,
        productUrl,
        mallName: "elevenst",
        isFreeShipping,
        reviewCount,
      });
    }

    // 상위 5개만 반환 (MVP)
    if (results.length >= 5) break;
  }

  return results;
}

/**
 * 개발 환경용 Mock 데이터 생성 함수
 * 11번가 크롤링이 차단될 경우 테스트용 데이터를 반환합니다.
 */
function getMock11stResults(keyword: string): SearchResultItem[] {
  return [
    {
      productName: `[11번가] ${keyword} 특가 상품 1`,
      price: 26500,
      originalPrice: 32000,
      imageUrl: "https://placehold.co/300x300/E91E63/FFFFFF?text=11st",
      productUrl: `https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(keyword)}`,
      mallName: "elevenst",
      isFreeShipping: true,
      reviewCount: 234,
    },
    {
      productName: `[11번가] ${keyword} 할인 상품 2`,
      price: 31000,
      imageUrl: "https://placehold.co/300x300/E91E63/FFFFFF?text=11st",
      productUrl: `https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(keyword)}`,
      mallName: "elevenst",
      isFreeShipping: false,
      reviewCount: 156,
    },
    {
      productName: `[11번가] ${keyword} 인기 상품 3`,
      price: 39900,
      originalPrice: 49900,
      imageUrl: "https://placehold.co/300x300/E91E63/FFFFFF?text=11st",
      productUrl: `https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(keyword)}`,
      mallName: "elevenst",
      isFreeShipping: true,
      reviewCount: 789,
    },
  ];
}
