import { MallPrice, Product } from "@/types";

export interface ScraperResult {
  product: Partial<Product>;
  price: Omit<MallPrice, "id" | "productId" | "fetchedAt">;
  success: boolean;
  error?: string;
}

// 키워드 검색 결과 타입 (MVP용 간소화 버전)
export interface SearchResultItem {
  productName: string;
  price: number;
  originalPrice?: number; // 할인 전 가격
  imageUrl: string;
  productUrl: string;
  mallName: "coupang" | "naver" | "elevenst";
  isRocketDelivery?: boolean; // 쿠팡 로켓배송 여부
  isFreeShipping?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface MallScraper {
  name: string;
  matchUrl(url: string): boolean;
  scrape(url: string): Promise<ScraperResult>;
  search(keyword: string): Promise<SearchResultItem[]>;
}
