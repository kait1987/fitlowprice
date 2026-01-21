"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PriceCard } from "@/components/features/PriceCard";
import { DiscountRule, MallPrice, SearchResponse } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store";
import { AlertCircle } from "lucide-react";

// Mock Data for MVP
const MOCK_DATA: Record<string, SearchResponse & { rules: DiscountRule[] }> = {
  "mock-product-id": {
    product: {
      id: "mock-product-id",
      name: "Apple 에어팟 프로 2세대 맥세이프 호환 (USB-C)",
      imageUrl:
        "https://dummyimage.com/400x400/eeeeee/000000&text=AirPods+Pro+2",
      createdAt: new Date().toISOString(),
    },
    prices: [
      {
        id: "p1",
        productId: "mock-product-id",
        mallName: "coupang",
        basePrice: 329000,
        shippingFee: 0,
        productUrl: "https://www.coupang.com",
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "p2",
        productId: "mock-product-id",
        mallName: "naver",
        basePrice: 315000,
        shippingFee: 3000,
        productUrl: "https://shopping.naver.com",
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "p3",
        productId: "mock-product-id",
        mallName: "elevenst",
        basePrice: 335000,
        shippingFee: 0,
        productUrl: "https://www.11st.co.kr",
        fetchedAt: new Date().toISOString(),
      },
    ],
    rules: [
      {
        id: "r1",
        mallName: "coupang",
        ruleType: "membership",
        ruleName: "와우 멤버십",
        discountType: "fixed",
        discountValue: 0, // In this case mostly free shipping, but let's say 0 for basic
        conditions: "무료배송 혜택",
      },
      {
        id: "r2",
        mallName: "coupang",
        ruleType: "coupon",
        ruleName: "웰컴 쿠폰",
        discountType: "percent",
        discountValue: 10,
        maxDiscount: 10000,
      },
      {
        id: "r3",
        mallName: "naver",
        ruleType: "membership",
        ruleName: "플러스 멤버십",
        discountType: "percent",
        discountValue: 4,
        conditions: "최대 4% 적립 (가격 차감 효과)",
      },
      {
        id: "r4",
        mallName: "elevenst",
        ruleType: "coupon",
        ruleName: "우주패스 할인",
        discountType: "fixed",
        discountValue: 5000,
      },
      {
        id: "r5",
        mallName: "elevenst",
        ruleType: "point",
        ruleName: "SK Pay 포인트",
        discountType: "fixed",
        discountValue: 1000,
        conditions: "1,000P 보유 시",
      },
    ],
  },
};

export default function ComparePage({
  params,
}: {
  params: { productId: string };
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { productId } = params;

  const [data, setData] = useState<
    (SearchResponse & { rules: DiscountRule[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const { selectedDiscounts } = useAppStore();

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      // In real app: fetch(`/api/products/${productId}`)...
      const result = MOCK_DATA["mock-product-id"]; // Always return mock for now
      setData(result);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [productId]);

  // Dynamic lowest price calculation logic for sorting
  const getFinalPrice = (price: MallPrice, rules: DiscountRule[]) => {
    const selectedIds = selectedDiscounts[price.mallName] || [];
    const final = price.basePrice + price.shippingFee;
    let discountTotal = 0;

    rules
      .filter(
        (r) => r.mallName === price.mallName && selectedIds.includes(r.id),
      )
      .forEach((r) => {
        if (r.discountType === "fixed") {
          discountTotal += r.discountValue;
        } else {
          let amount = (final * r.discountValue) / 100;
          if (r.maxDiscount) amount = Math.min(amount, r.maxDiscount);
          discountTotal += amount;
        }
      });

    return Math.max(0, final - discountTotal);
  };

  if (loading) {
    return (
      <div className="container py-12 space-y-8 max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-20 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">상품을 찾을 수 없습니다</h2>
        <p className="text-muted-foreground">
          요청하신 상품 정보가 없거나 삭제되었습니다.
        </p>
      </div>
    );
  }

  // Calculate prices for sorting
  const pricesWithCalc = data.prices.map((price) => ({
    ...price,
    finalPrice: getFinalPrice(price, data.rules),
  }));

  // Sort by final price
  pricesWithCalc.sort((a, b) => a.finalPrice - b.finalPrice);

  const lowestPrice = pricesWithCalc[0].finalPrice;

  return (
    <div className="container py-8 md:py-12 space-y-8 max-w-6xl">
      {/* Product Header */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center border-b pb-8">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg border bg-white overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.product.imageUrl || "/placeholder.png"}
            alt={data.product.name}
            className="object-contain w-full h-full p-2"
          />
        </div>
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight break-keep">
            {data.product.name}
          </h1>
          <p className="text-muted-foreground">
            검색어:{" "}
            <span className="font-medium text-foreground">
              {query || productId}
            </span>
          </p>
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-primary/5 p-4 rounded-lg text-sm text-primary-foreground/90 flex items-start md:items-center gap-2">
        <span className="text-xl shrink-0">💡</span>
        <p className="text-zinc-700">
          <strong>보유하신 쿠폰이나 멤버십을 체크해보세요!</strong>
          <br className="md:hidden" />
          실시간으로 내 최종가가 계산되어 순위가 바뀝니다.
        </p>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        {pricesWithCalc.map((price) => (
          <PriceCard
            key={price.id}
            price={price}
            rules={data.rules.filter((r) => r.mallName === price.mallName)}
            isCheapest={price.finalPrice === lowestPrice}
            priceDifference={price.finalPrice - lowestPrice}
          />
        ))}
      </div>
    </div>
  );
}
