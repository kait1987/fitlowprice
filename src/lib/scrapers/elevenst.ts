import { MallScraper, ScraperResult } from "./types";

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

  async search(_keyword: string): Promise<ScraperResult[]> {
    return [];
  },
};
