export type MallID = "coupang" | "naver" | "elevenst";
export type RuleType = "coupon" | "point" | "membership";
export type DiscountType = "percent" | "fixed";

export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  createdAt: string;
}

export interface MallPrice {
  id: string;
  productId: string;
  mallName: MallID;
  basePrice: number;
  shippingFee: number;
  productUrl: string;
  fetchedAt: string;
}

export interface DiscountRule {
  id: string;
  mallName: MallID;
  ruleType: RuleType;
  ruleName: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  conditions?: string;
}

// Client-side types
export interface AppliedDiscount {
  ruleId: string;
  ruleName: string;
  amount: number; // Calculated discount amount
}

export interface CalculatedPrice {
  mallName: MallID;
  basePrice: number;
  shippingFee: number;
  finalPrice: number;
  appliedDiscounts: AppliedDiscount[];
  isCheapest: boolean;
  priceDifference: number; // Difference from cheapest (0 if cheapest)
}

// API Responses
export interface SearchResponse {
  product: Product;
  prices: MallPrice[];
}

export interface CalculateRequest {
  productId: string;
  selectedRuleIds: Record<MallID, string[]>; // { coupang: ['rule_id_1'], ... }
}

export interface CalculateResponse {
  results: CalculatedPrice[];
  cheapestMall: MallID;
}
