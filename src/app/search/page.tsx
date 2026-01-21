"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Search,
  ArrowLeft,
  ExternalLink,
  Star,
  Truck,
} from "lucide-react";
import { SearchResultItem } from "@/lib/scrapers/types";
import { cn } from "@/lib/utils";

interface SearchApiResponse {
  keyword: string;
  results: {
    coupang: SearchResultItem[];
    naver: SearchResultItem[];
    elevenst: SearchResultItem[];
  };
  totalCount: number;
  searchedAt: string;
}

const MALL_INFO = {
  coupang: {
    name: "쿠팡",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  naver: {
    name: "네이버",
    color: "bg-green-500",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  elevenst: {
    name: "11번가",
    color: "bg-red-500",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
} as const;

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [data, setData] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (keyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: keyword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "검색에 실패했습니다.");
      }

      const result: SearchApiResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 모든 결과를 가격순으로 정렬
  const getAllResults = () => {
    if (!data) return [];
    const allResults: SearchResultItem[] = [
      ...data.results.coupang,
      ...data.results.naver,
      ...data.results.elevenst,
    ];
    return allResults.sort((a, b) => a.price - b.price);
  };

  const sortedResults = getAllResults();

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="w-fit -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          홈으로
        </Button>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="flex-1 h-12 text-lg"
          />
          <Button type="submit" size="lg" className="h-12 px-6">
            <Search className="mr-2 h-5 w-5" />
            검색
          </Button>
        </form>

        {query && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>
              <strong className="text-foreground">&quot;{query}&quot;</strong>{" "}
              검색 결과
            </span>
            {data && <span className="text-sm">(총 {data.totalCount}개)</span>}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16 space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">검색 오류</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => performSearch(query)} variant="outline">
            다시 시도
          </Button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && data && data.totalCount === 0 && (
        <div className="text-center py-16 space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">검색 결과가 없습니다</h2>
          <p className="text-muted-foreground">
            다른 검색어로 다시 시도해보세요.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && data && data.totalCount > 0 && (
        <>
          {/* Stats */}
          <div className="flex gap-4 mb-6 flex-wrap">
            {Object.entries(data.results).map(([mall, items]) => (
              <div
                key={mall}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm font-medium",
                  MALL_INFO[mall as keyof typeof MALL_INFO].borderColor,
                )}
              >
                <span
                  className={
                    MALL_INFO[mall as keyof typeof MALL_INFO].textColor
                  }
                >
                  {MALL_INFO[mall as keyof typeof MALL_INFO].name}
                </span>
                <span className="text-muted-foreground ml-2">
                  {items.length}개
                </span>
              </div>
            ))}
          </div>

          {/* Product List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map((item, index) => {
              const mallInfo = MALL_INFO[item.mallName];
              const isLowest = index === 0;

              return (
                <a
                  key={`${item.mallName}-${index}`}
                  href={item.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group relative rounded-xl border bg-card p-4 pt-12 space-y-4 transition-all hover:shadow-lg hover:-translate-y-1",
                    isLowest && "ring-2 ring-primary",
                  )}
                >
                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex gap-2 z-10">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-bold text-white",
                        mallInfo.color,
                      )}
                    >
                      {mallInfo.name}
                    </span>
                    {isLowest && (
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground">
                        최저가
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                      {item.productName}
                    </h3>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-muted-foreground">원</span>
                    </div>

                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}원
                        </span>
                        <span className="text-sm font-medium text-destructive">
                          {Math.round(
                            (1 - item.price / item.originalPrice) * 100,
                          )}
                          % 할인
                        </span>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.isRocketDelivery && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          🚀 로켓배송
                        </span>
                      )}
                      {item.isFreeShipping && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <Truck className="h-3 w-3" />
                          무료배송
                        </span>
                      )}
                      {item.rating && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          <Star className="h-3 w-3 fill-current" />
                          {item.rating}
                        </span>
                      )}
                      {item.reviewCount && (
                        <span className="text-xs text-muted-foreground">
                          리뷰 {item.reviewCount.toLocaleString()}개
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Link Indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </div>
                </a>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State - No Query */}
      {!query && (
        <div className="text-center py-16 space-y-4">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">상품을 검색해보세요</h2>
          <p className="text-muted-foreground">
            쿠팡, 네이버, 11번가의 가격을 한번에 비교할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
