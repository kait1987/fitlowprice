import { MallScraper, ScraperResult, SearchResultItem } from "./types";
import {
  searchNaverPython,
  checkPythonScraperHealth,
  type PythonScraperResult,
} from "./python-client";

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
   * 네이버 쇼핑 검색
   * 1순위: Python Selenium 스크래퍼 (실데이터)
   * 2순위: 네이버 공식 API (API 키 필요)
   * 3순위: Mock 데이터 (개발 환경)
   */
  async search(keyword: string): Promise<SearchResultItem[]> {
    // 1. Python Selenium 스크래퍼 시도
    try {
      const isHealthy = await checkPythonScraperHealth();
      if (isHealthy) {
        console.log("Using Python scraper for Naver...");
        const pythonResults = await searchNaverPython(keyword);
        const mappedResults = mapPythonResultsToSearchItems(pythonResults);
        if (mappedResults.length > 0) {
          console.log(`Python scraper returned ${mappedResults.length} results`);
          return mappedResults;
        }
      }
    } catch (error) {
      console.warn("Python scraper failed, falling back to Naver API:", error);
    }

    // 2. 네이버 공식 API
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

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
 * Python 스크래퍼 결과를 SearchResultItem 형식으로 변환
 */
function mapPythonResultsToSearchItems(
  results: PythonScraperResult[],
): SearchResultItem[] {
  return results.map((item) => ({
    productName: item.name,
    price: item.price,
    imageUrl: item.imageUrl || "",
    productUrl: item.url,
    mallName: "naver" as const,
    shippingFee: item.shippingFee,
    isFreeShipping: item.shippingFee === 0,
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
