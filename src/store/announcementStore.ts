import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockAnnouncements } from "../data/mockData";
import type { Announcement, Category } from "../types";

interface AnnouncementState {
  announcements: Announcement[];
  searchQuery: string;
  filterCategory: Category | "all";
  filterDeadlines: string[];
  filterRegions: string[];
  filterBenefits: string[];
  filterEligibility: string[];
  sortBy: "popular" | "latest" | "deadline" | "recommended";
  setSearchQuery: (q: string) => void;
  setFilterCategory: (c: Category | "all") => void;
  setFilterDeadlines: (v: string[]) => void;
  setFilterRegions: (v: string[]) => void;
  setFilterBenefits: (v: string[]) => void;
  setFilterEligibility: (v: string[]) => void;
  clearAllFilters: () => void;
  getTotalFilterCount: () => number;
  setSortBy: (s: "popular" | "latest" | "deadline" | "recommended") => void;
  toggleBookmark: (id: string) => void;
  getFiltered: () => Announcement[];
  getBookmarked: () => Announcement[];
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set, get) => ({
      announcements: mockAnnouncements,
      searchQuery: "",
      filterCategory: "all",
      filterDeadlines: [],
      filterRegions: [],
      filterBenefits: [],
      filterEligibility: [],
      sortBy: "popular",

      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterCategory: (c) => set({ filterCategory: c }),
      setFilterDeadlines: (v) => set({ filterDeadlines: v }),
      setFilterRegions: (v) => set({ filterRegions: v }),
      setFilterBenefits: (v) => set({ filterBenefits: v }),
      setFilterEligibility: (v) => set({ filterEligibility: v }),
      clearAllFilters: () =>
        set({
          filterCategory: "all",
          filterDeadlines: [],
          filterRegions: [],
          filterBenefits: [],
          filterEligibility: [],
        }),
      getTotalFilterCount: () => {
        const {
          filterCategory,
          filterDeadlines,
          filterRegions,
          filterBenefits,
          filterEligibility,
        } = get();
        return (
          (filterCategory !== "all" ? 1 : 0) +
          filterDeadlines.length +
          filterRegions.length +
          filterBenefits.length +
          filterEligibility.length
        );
      },
      setSortBy: (s) => set({ sortBy: s }),

      toggleBookmark: (id) =>
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  isBookmarked: !a.isBookmarked,
                  bookmarkCount: a.isBookmarked
                    ? a.bookmarkCount - 1
                    : a.bookmarkCount + 1,
                }
              : a,
          ),
        })),

      getFiltered: () => {
        const {
          announcements,
          searchQuery,
          filterCategory,
          filterDeadlines,
          filterRegions,
          filterBenefits,
          filterEligibility,
          sortBy,
        } = get();
        let result = announcements;

        if (filterCategory !== "all") {
          result = result.filter((a) => a.category === filterCategory);
        }

        if (filterDeadlines.length > 0) {
          const now = Date.now();
          result = result.filter((a) => {
            const diff = Math.ceil(
              (new Date(a.endDate).getTime() - now) / 86400000,
            );
            return filterDeadlines.some((d) => {
              if (d === "모집중") return diff >= 7;
              if (d === "곧 마감") return diff >= 0 && diff < 7;
              if (d === "마감") return diff < 0;
              return false;
            });
          });
        }

        if (filterRegions.length > 0) {
          result = result.filter(
            (a) =>
              a.region === "전국" ||
              filterRegions.some((r) => a.region.includes(r)),
          );
        }

        if (filterBenefits.length > 0) {
          result = result.filter((a) =>
            filterBenefits.some((b) => a.benefitType.includes(b)),
          );
        }

        if (filterEligibility.length > 0) {
          result = result.filter(
            (a) =>
              !a.targetAge ||
              filterEligibility.some((e) => a.targetAge?.includes(e)),
          );
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          result = result.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.organization.toLowerCase().includes(q) ||
              a.tags.some((t) => t.toLowerCase().includes(q)),
          );
        }

        switch (sortBy) {
          case "popular":
            return [...result].sort(
              (a, b) => b.bookmarkCount - a.bookmarkCount,
            );
          case "latest":
            return [...result].sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime(),
            );
          case "deadline":
            return [...result].sort(
              (a, b) =>
                new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
            );
          case "recommended":
            return [...result].sort(
              (a, b) => b.bookmarkCount - a.bookmarkCount,
            );
          default:
            return result;
        }
      },

      getBookmarked: () => get().announcements.filter((a) => a.isBookmarked),
    }),
    { name: "didim-announcements" },
  ),
);
