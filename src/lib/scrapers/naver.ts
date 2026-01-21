import { MallScraper, ScraperResult } from "./types";

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

  async search(_keyword: string): Promise<ScraperResult[]> {
    return [];
  },
};
