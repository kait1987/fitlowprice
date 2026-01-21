"use client";

import { useAppStore } from "@/store";
import { MallPrice, DiscountRule, MallID } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface PriceCardProps {
  price: MallPrice;
  rules: DiscountRule[];
  isCheapest: boolean;
  priceDifference: number;
}

const MALL_LOGOS: Record<MallID, string> = {
  coupang:
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/Coupang_logo.svg", // Placeholder URL
  naver:
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Naver_logo_initial.svg", // Placeholder URL
  elevenst: "https://upload.wikimedia.org/wikipedia/commons/f/f5/11st_logo.svg", // Placeholder URL
};

const MALL_NAMES: Record<MallID, string> = {
  coupang: "쿠팡",
  naver: "네이버",
  elevenst: "11번가",
};

export function PriceCard({
  price,
  rules,
  isCheapest,
  priceDifference,
}: PriceCardProps) {
  const { selectedDiscounts, toggleDiscount } = useAppStore();
  const mallRules = rules; // Already filtered by parent if needed, or filter here: rules.filter(r => r.mallName === price.mallName)

  // Calculate local final price for this card based on selection (UI only logic, centralized logic in store/calculator is better but for MVP this works)
  // Actually, we should use the calculated result passed from parent or store.
  // Let's assume the parent passes the calculated state or we compute it lightly here for display.
  // Better: The store should hold the 'calculatedResults' and we find the one matching this mall.

  const selectedRuleIds = selectedDiscounts[price.mallName] || [];

  // Simple calculation for display (in real app, use the centralized calculator result)
  let calculatedFinalPrice = price.basePrice + price.shippingFee;
  let totalDiscount = 0;

  mallRules.forEach((rule) => {
    if (selectedRuleIds.includes(rule.id)) {
      let discountAmount = 0;
      if (rule.discountType === "fixed") {
        discountAmount = rule.discountValue;
      } else {
        discountAmount = (calculatedFinalPrice * rule.discountValue) / 100;
        if (rule.maxDiscount) {
          discountAmount = Math.min(discountAmount, rule.maxDiscount);
        }
      }
      totalDiscount += discountAmount;
    }
  });

  calculatedFinalPrice -= totalDiscount;
  if (calculatedFinalPrice < 0) calculatedFinalPrice = 0;

  return (
    <Card
      className={`w-full transition-all duration-200 ${isCheapest ? "border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]" : "border-border"}`}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative rounded-full overflow-hidden border bg-white flex items-center justify-center font-bold text-xs text-muted-foreground">
              {/* Image would go here, text fallback for now */}
              {MALL_NAMES[price.mallName][0]}
            </div>
            <CardTitle className="text-lg font-bold">
              {MALL_NAMES[price.mallName]}
            </CardTitle>
          </div>
          {isCheapest && (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">
              최저가🏆
            </Badge>
          )}
          {!isCheapest && priceDifference > 0 && (
            <Badge variant="secondary" className="text-muted-foreground">
              +{priceDifference.toLocaleString()}원
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Base Price & Shipping */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>기본가</span>
            <span>{price.basePrice.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>배송비</span>
            <span>
              {price.shippingFee === 0
                ? "무료"
                : `+${price.shippingFee.toLocaleString()}원`}
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border" />

        {/* Discount Options */}
        <div className="space-y-3">
          <span className="text-sm font-medium">✨ 적용 가능한 혜택</span>
          {mallRules.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              적용 가능한 혜택이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {mallRules.map((rule) => (
                <div key={rule.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={rule.id}
                    checked={selectedRuleIds.includes(rule.id)}
                    onCheckedChange={() =>
                      toggleDiscount(price.mallName, rule.id)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={rule.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {rule.ruleName}
                      <span className="ml-1 text-xs text-primary">
                        {rule.discountType === "percent"
                          ? `(-${rule.discountValue}%)`
                          : `(-${rule.discountValue.toLocaleString()}원)`}
                      </span>
                    </Label>
                    {rule.conditions && (
                      <p className="text-xs text-muted-foreground">
                        {rule.conditions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-col space-y-4 pt-2">
        <div className="w-full flex justify-between items-end bg-secondary/20 p-4 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">
            내 최종가
          </span>
          <span
            className={`text-2xl font-extrabold ${isCheapest ? "text-primary" : "text-foreground"}`}
          >
            {calculatedFinalPrice.toLocaleString()}원
          </span>
        </div>

        <Button
          className="w-full h-11 text-base"
          variant={isCheapest ? "default" : "outline"}
          asChild
        >
          <a href={price.productUrl} target="_blank" rel="noopener noreferrer">
            <span className="mr-2">
              {isCheapest ? "이 가격으로 구매하기" : "상품 보러가기"}
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
