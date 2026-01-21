import { NextResponse } from "next/server";
import {
  CalculateRequest,
  CalculateResponse,
  DiscountRule,
  AppliedDiscount,
  CalculatedPrice,
} from "@/types";

// Mock implementation of discounts database
const MOCK_RULES: DiscountRule[] = [
  {
    id: "r1",
    mallName: "coupang",
    ruleType: "membership",
    ruleName: "와우 멤버십",
    discountType: "fixed",
    discountValue: 0,
    conditions: "무료배송",
  },
  {
    id: "r2",
    mallName: "coupang",
    ruleType: "coupon",
    ruleName: "첫 구매 쿠폰",
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 5000,
  },
  {
    id: "r3",
    mallName: "naver",
    ruleType: "membership",
    ruleName: "네이버플러스",
    discountType: "percent",
    discountValue: 4,
  },
];

export async function POST(request: Request) {
  try {
    const body: CalculateRequest = await request.json();

    // In a real app, we would fetch the Product and MallPrices from DB using body.productId
    // Here we just mock that data again
    const mockPrices = [
      { mallName: "coupang", basePrice: 25000, shippingFee: 3000 },
      { mallName: "naver", basePrice: 24500, shippingFee: 3000 },
    ] as const;

    const results: CalculatedPrice[] = mockPrices.map((price) => {
      const selectedRules = body.selectedRuleIds[price.mallName] || [];
      const appliedDiscounts: AppliedDiscount[] = [];
      let currentPrice = price.basePrice + price.shippingFee;

      // Apply selected rules
      selectedRules.forEach((ruleId) => {
        const rule = MOCK_RULES.find((r) => r.id === ruleId);
        if (rule) {
          if (rule.ruleName.includes("와우") && price.shippingFee > 0) {
            // Special logic for shipping fee
            appliedDiscounts.push({
              ruleId: rule.id,
              ruleName: rule.ruleName,
              amount: price.shippingFee,
            });
            currentPrice -= price.shippingFee;
          } else if (rule.discountType === "fixed") {
            appliedDiscounts.push({
              ruleId: rule.id,
              ruleName: rule.ruleName,
              amount: rule.discountValue,
            });
            currentPrice -= rule.discountValue;
          } else {
            let amount = (currentPrice * rule.discountValue) / 100;
            if (rule.maxDiscount) amount = Math.min(amount, rule.maxDiscount);
            appliedDiscounts.push({
              ruleId: rule.id,
              ruleName: rule.ruleName,
              amount,
            });
            currentPrice -= amount;
          }
        }
      });

      return {
        mallName: price.mallName,
        basePrice: price.basePrice,
        shippingFee: price.shippingFee,
        finalPrice: Math.max(0, currentPrice),
        appliedDiscounts,
        isCheapest: false, // Calculated after
        priceDifference: 0, // Calculated after
      };
    });

    // Sort and set cheapest
    results.sort((a, b) => a.finalPrice - b.finalPrice);
    results[0].isCheapest = true;
    const cheapestPrice = results[0].finalPrice;

    results.forEach((r) => {
      r.priceDifference = r.finalPrice - cheapestPrice;
    });

    const response: CalculateResponse = {
      results,
      cheapestMall: results[0].mallName,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
