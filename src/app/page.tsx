import SearchSection from "@/components/features/SearchSection";

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-12 gap-12">
      <SearchSection />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary font-bold text-xl">
            1
          </div>
          <h3 className="font-bold text-lg">링크 붙여넣기</h3>
          <p className="text-muted-foreground text-sm">
            사고 싶은 상품의 URL이나
            <br />
            이름을 입력하세요.
          </p>
        </div>
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary font-bold text-xl">
            2
          </div>
          <h3 className="font-bold text-lg">혜택 선택하기</h3>
          <p className="text-muted-foreground text-sm">
            내가 가진 멤버십, 쿠폰을
            <br />
            선택하세요. (로그인 X)
          </p>
        </div>
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary font-bold text-xl">
            3
          </div>
          <h3 className="font-bold text-lg">진짜 최저가 확인</h3>
          <p className="text-muted-foreground text-sm">
            모든 혜택이 적용된
            <br />
            최종 가격을 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
