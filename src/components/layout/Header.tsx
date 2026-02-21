import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">FitLowPrice</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <p className="text-sm text-muted-foreground hidden md:block">
            진짜 최저가를 찾아드립니다
          </p>
        </div>
      </div>
    </header>
  );
}
