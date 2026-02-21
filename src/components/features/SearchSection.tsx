"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SearchSection() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { isLoading, setSearchQuery } = useAppStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("검색할 상품명을 입력해주세요.");
      return;
    }

    if (input.trim().length < 2) {
      toast.error("검색어는 2글자 이상 입력해주세요.");
      return;
    }

    setSearchQuery(input);
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  };

  return (
    <section className="w-full max-w-3xl mx-auto space-y-8 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          결정 피로, <span className="text-primary">그만.</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          상품명만 검색하세요. 쿠폰, 적립금까지 다 계산해서
          <br className="hidden sm:inline" />내 계정 기준 진짜 최저가를
          찾아드립니다.
        </p>
      </div>

      <div className="p-6 bg-card rounded-xl border shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Input
            placeholder="검색할 상품명을 입력하세요 (예: 신라면, 에어팟)"
            className="flex-1 h-12 text-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 px-8 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Search className="mr-2 h-5 w-5" />
            )}
            최저가 찾기
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          <span>지원 쇼핑몰:</span>
          <span className="font-medium text-foreground">쿠팡</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-medium text-foreground">네이버</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-medium text-foreground">11번가</span>
        </div>
      </div>
    </section>
  );
}
