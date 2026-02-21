import { NextResponse } from "next/server";
import { CoupangScraper } from "@/lib/scrapers/coupang";
import { NaverScraper } from "@/lib/scrapers/naver";
import { ElevenStScraper } from "@/lib/scrapers/elevenst";
import { SearchResultItem } from "@/lib/scrapers/types";

interface KeywordSearchResponse {
  keyword: string;
  results: {
    coupang: SearchResultItem[];
    naver: SearchResultItem[];
    elevenst: SearchResultItem[];
  };
  totalCount: number;
  searchedAt: string;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "검색어를 입력해주세요." },
        { status: 400 },
      );
    }

    const keyword = query.trim();

    if (keyword.length < 2) {
      return NextResponse.json(
        { error: "검색어는 2글자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    // 각 쇼핑몰 검색을 병렬로 실행
    const [coupangResults, naverResults, elevenstResults] = await Promise.all([
      CoupangScraper.search(keyword),
      NaverScraper.search(keyword),
      ElevenStScraper.search(keyword),
    ]);

    const response: KeywordSearchResponse = {
      keyword,
      results: {
        coupang: coupangResults,
        naver: naverResults,
        elevenst: elevenstResults,
      },
      totalCount:
        coupangResults.length + naverResults.length + elevenstResults.length,
      searchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
