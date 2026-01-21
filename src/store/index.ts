import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MallID, CalculatedPrice, SearchResponse } from "@/types";

interface AppState {
  // Search State
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data State
  currentProduct: SearchResponse["product"] | null;
  currentPrices: SearchResponse["prices"] | [];
  setSearchResult: (result: SearchResponse) => void;

  // Selection State
  selectedDiscounts: Record<MallID, string[]>; // Map of mall -> applied rule IDs
  toggleDiscount: (mall: MallID, ruleId: string) => void;

  // Calculation State
  calculatedResults: CalculatedPrice[];
  setCalculatedResults: (results: CalculatedPrice[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: false,
      error: null,
      searchQuery: "",
      currentProduct: null,
      currentPrices: [],
      selectedDiscounts: {
        coupang: [],
        naver: [],
        elevenst: [],
      },
      calculatedResults: [],

      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      setSearchResult: (result) =>
        set({
          currentProduct: result.product,
          currentPrices: result.prices,
          error: null,
        }),

      toggleDiscount: (mall, ruleId) =>
        set((state) => {
          const currentRules = state.selectedDiscounts[mall] || [];
          const isSelected = currentRules.includes(ruleId);

          return {
            selectedDiscounts: {
              ...state.selectedDiscounts,
              [mall]: isSelected
                ? currentRules.filter((id) => id !== ruleId)
                : [...currentRules, ruleId],
            },
          };
        }),

      setCalculatedResults: (results) => set({ calculatedResults: results }),
    }),
    {
      name: "fitlowprice-storage",
      partialize: () => ({
        // Persist only user preferences if needed, or nothing for now to keep fresh state
        // For MVP, maybe we don't persist active search data to avoid confusion on reload
      }),
    },
  ),
);
