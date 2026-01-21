import { MallScraper, ScraperResult, SearchResultItem } from "./types";

const NAVER_SHOPPING_API_URL = "https://openapi.naver.com/v1/search/shop.json";

export const NaverScraper: MallScraper = {
  name: "naver",

  matchUrl(url: string) {
    return (
      url.includes("smartstore.naver.com") || url.includes("brand.naver.com")
    );
  },

  async scrape(url: string): Promise<ScraperResult> {
    console.log(`Scraping Naver: ${url}`);

    return {
      success: true,
      product: {
        name: "Mock Product from Naver",
        imageUrl: "https://dummyimage.com/400x400/green/white&text=Naver",
      },
      price: {
        mallName: "naver",
        basePrice: 10500,
        shippingFee: 3000,
        productUrl: url,
      },
    };
  },

  /**
   * 네이버 쇼핑 검색 API를 통한 상품 검색
   * 공식 API를 사용하므로 가장 안정적입니다.
   * 개발 환경에서 API 키가 없거나 실패 시 Mock 데이터를 반환합니다.
   *
   * 환경변수 필요:
   * - NAVER_CLIENT_ID: 네이버 개발자 센터에서 발급받은 Client ID
   * - NAVER_CLIENT_SECRET: 네이버 개발자 센터에서 발급받은 Client Secret
   *
   * @see https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md
   */
  async search(keyword: string): Promise<SearchResultItem[]> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    // API 키가 없거나 placeholder면 Mock 데이터 반환
    if (!clientId || !clientSecret || clientId.includes("your-")) {
      console.warn(
        "Naver API credentials not found. Using mock data for development.",
      );
      if (process.env.NODE_ENV === "development") {
        return getMockNaverResults(keyword);
      }
      return [];
    }

    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const apiUrl = `${NAVER_SHOPPING_API_URL}?query=${encodedKeyword}&display=5&sort=sim`;

      const response = await fetch(apiUrl, {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      });

      if (!response.ok) {
        console.error(`Naver API failed: ${response.status}`);
        if (process.env.NODE_ENV === "development") {
          return getMockNaverResults(keyword);
        }
        return [];
      }

      const data = await response.json();
      const results = parseNaverApiResponse(data);

      if (results.length === 0 && process.env.NODE_ENV === "development") {
        return getMockNaverResults(keyword);
      }

      return results;
    } catch (error) {
      console.error("Naver search error:", error);
      if (process.env.NODE_ENV === "development") {
        return getMockNaverResults(keyword);
      }
      return [];
    }
  },
};

/**
 * 네이버 쇼핑 API 응답 파싱
 *
 * API 응답 구조:
 * {
 *   "items": [
 *     {
 *       "title": "상품명 <b>키워드</b>",
 *       "link": "상품 URL",
 *       "image": "이미지 URL",
 *       "lprice": "최저가 (문자열)",
 *       "hprice": "최고가 (문자열, 비어있을 수 있음)",
 *       "mallName": "판매처 이름",
 *       "productId": "상품 ID",
 *       "productType": "상품 타입 (1: 일반, 2: 가격비교, 3: 카탈로그)"
 *     }
 *   ]
 * }
 */
interface NaverShoppingItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  productType: string;
}

interface NaverApiResponse {
  items: NaverShoppingItem[];
  total: number;
  start: number;
  display: number;
}

function parseNaverApiResponse(data: NaverApiResponse): SearchResultItem[] {
  if (!data.items || !Array.isArray(data.items)) {
    return [];
  }

  return data.items.map((item) => ({
    productName: item.title.replace(/<\/?b>/g, ""), // HTML 태그 제거
    price: parseInt(item.lprice, 10) || 0,
    originalPrice: item.hprice ? parseInt(item.hprice, 10) : undefined,
    imageUrl: item.image || "",
    productUrl: item.link || "",
    mallName: "naver" as const,
    isFreeShipping: undefined, // API에서 제공하지 않음
  }));
}

/**
 * 개발 환경용 Mock 데이터 생성 함수
 * 네이버 API 키가 없을 경우 테스트용 데이터를 반환합니다.
 */
function getMockNaverResults(keyword: string): SearchResultItem[] {
  return [
    {
      productName: `[네이버] ${keyword} 인기 상품 1`,
      price: 27500,
      originalPrice: 35000,
      imageUrl: "https://placehold.co/300x300/00C73C/FFFFFF?text=Naver",
      productUrl: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(keyword)}`,
      mallName: "naver",
      isFreeShipping: true,
    },
    {
      productName: `[네이버] ${keyword} 추천 상품 2`,
      price: 32000,
      imageUrl: "https://placehold.co/300x300/00C73C/FFFFFF?text=Naver",
      productUrl: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(keyword)}`,
      mallName: "naver",
      isFreeShipping: true,
    },
    {
      productName: `[네이버] ${keyword} 베스트 상품 3`,
      price: 38900,
      originalPrice: 45000,
      imageUrl: "https://placehold.co/300x300/00C73C/FFFFFF?text=Naver",
      productUrl: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(keyword)}`,
      mallName: "naver",
      isFreeShipping: false,
    },
  ];
}
