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

function filterResults(
  keyword: string,
  items: SearchResultItem[],
): SearchResultItem[] {
  const baseExclusions = [
    "케이스",
    "실리콘",
    "파우치",
    "호환",
    "필름",
    "보호필름",
    "스트랩",
    "키링",
    "액세서리",
    "악세사리",
    "이어팁",
    "스킨",
    "단품",
    "왼쪽",
    "오른쪽",
    "유닛",
    "충전기",
    "충전본체",
  ];

  // 사용자가 검색한 키워드에 포함된 제외어는 허용 (예: "에어팟 실리콘 케이스" 검색 시 "실리콘", "케이스" 허용)
  const activeExclusions = baseExclusions.filter(
    (word) => !keyword.includes(word),
  );

  const searchWords = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const collapsedKeyword = keyword.replace(/\s+/g, "").toLowerCase();

  return items.filter((item) => {
    const productName = item.productName.toLowerCase();
    const collapsedProductName = productName.replace(/\s+/g, "");

    // 1. 악세서리 및 관련 없는 상품 제외
    if (activeExclusions.some((word) => productName.includes(word))) {
      return false;
    }

    // 2. 검색어가 띄어쓰기 없이 다 붙어있는 경우 포함하면 통과 (예: 에어팟프로3)
    if (collapsedProductName.includes(collapsedKeyword)) {
      return true;
    }

    // 3. 사용자가 입력한 모든 단어가 상품명에 포함되어야 통과
    return searchWords.every((word) => productName.includes(word));
  });
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

    // 각 쇼핑몰 검색을 순차적으로 실행하고 필터링 적용
    const coupangResults = filterResults(
      keyword,
      await CoupangScraper.search(keyword),
    );
    const naverResults = filterResults(
      keyword,
      await NaverScraper.search(keyword),
    );
    const elevenstResults = filterResults(
      keyword,
      await ElevenStScraper.search(keyword),
    );

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
