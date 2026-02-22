import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">FitLowPrice</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <p className="text-sm text-muted-foreground hidden md:block">
            진짜 최저가를 찾아드립니다
          </p>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              어떻게 쓰나요?
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            {!user ? (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
            ) : (
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  로그아웃
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
