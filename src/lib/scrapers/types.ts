import { MallPrice, Product } from "@/types";

export interface ScraperResult {
  product: Partial<Product>;
  price: Omit<MallPrice, "id" | "productId" | "fetchedAt">;
  success: boolean;
  error?: string;
}

export interface MallScraper {
  name: string;
  matchUrl(url: string): boolean;
  scrape(url: string): Promise<ScraperResult>;
  search(keyword: string): Promise<ScraperResult[]>; // For name-based search
}
