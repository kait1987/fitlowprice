import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

        <label className="text-md" htmlFor="email">
          이메일
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />

        <label className="text-md" htmlFor="password">
          비밀번호
        </label>
        <Input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <Button formAction={login} className="w-full mb-2">
          이메일로 로그인
        </Button>

        <div className="text-sm text-center text-muted-foreground mt-4">
          계정이 없으신가요?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            회원가입
          </Link>
        </div>

        {resolvedSearchParams?.message && (
          <p className="mt-4 p-4 bg-red-100 text-red-700 text-center rounded-md">
            {resolvedSearchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
