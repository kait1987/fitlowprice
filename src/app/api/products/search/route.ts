import { NextResponse } from "next/server";
// import { CoupangScraper } from "@/lib/scrapers/coupang";
// import { NaverScraper } from "@/lib/scrapers/naver";
// import { ElevenStScraper } from "@/lib/scrapers/elevenst";
import { SearchResponse } from "@/types";

// const SCRAPERS = [CoupangScraper, NaverScraper, ElevenStScraper];

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Identify if it's a URL or keyword
    const isUrl = query.startsWith("http");

    // For MVP, if it's a URL, we just mock the scraping result from all 3 malls using the single URL as a seed
    // In reality, if it's a URL for one mall, we need to find the product name and then search other malls.

    // Mocking the result for now to connect FE to BE flow
    const mockResponse: SearchResponse = {
      product: {
        id: "generated-id-" + Date.now(),
        name: isUrl ? "상품명 (URL 검색 결과)" : query,
        imageUrl: "https://dummyimage.com/600x600/eee/000&text=Product+Image",
        createdAt: new Date().toISOString(),
      },
      prices: [
        {
          id: "p-coupang",
          productId: "generated-id-" + Date.now(),
          mallName: "coupang",
          basePrice: 25000,
          shippingFee: 0,
          productUrl: "https://coupang.com",
          fetchedAt: new Date().toISOString(),
        },
        {
          id: "p-naver",
          productId: "generated-id-" + Date.now(),
          mallName: "naver",
          basePrice: 24500,
          shippingFee: 3000,
          productUrl: "https://naver.com",
          fetchedAt: new Date().toISOString(),
        },
        {
          id: "p-elevenst",
          productId: "generated-id-" + Date.now(),
          mallName: "elevenst",
          basePrice: 26000,
          shippingFee: 0,
          productUrl: "https://11st.co.kr",
          fetchedAt: new Date().toISOString(),
        },
      ],
    };

    return NextResponse.json(mockResponse);
  } catch {
    console.error("Search API Error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
