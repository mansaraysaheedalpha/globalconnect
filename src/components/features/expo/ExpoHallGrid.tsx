// src/components/features/expo/ExpoHallGrid.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExpoBooth, BoothTier, BOOTH_TIER_CONFIG } from "./types";
import { ExpoBoothCard } from "./ExpoBoothCard";

export interface ExpoHallGridProps {
  booths: ExpoBooth[];
  categories: string[];
  onBoothClick: (booth: ExpoBooth) => void;
  selectedBoothId?: string;
}

type SortOption = "tier" | "visitors" | "name" | "staff";
type ViewMode = "grid" | "list";

export function ExpoHallGrid({
  booths,
  categories,
  onBoothClick,
  selectedBoothId,
}: ExpoHallGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<BoothTier[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("tier");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Filter and sort booths
  const filteredBooths = useMemo(() => {
    let result = [...booths];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.tagline?.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Tier filter
    if (selectedTiers.length > 0) {
      result = result.filter((b) => selectedTiers.includes(b.tier));
    }

    // Online staff filter
    if (showOnlineOnly) {
      result = result.filter((b) =>
        b.staffPresence.some((s) => s.status === "ONLINE")
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "tier":
          const tierDiff =
            BOOTH_TIER_CONFIG[a.tier].priority -
            BOOTH_TIER_CONFIG[b.tier].priority;
          if (tierDiff !== 0) return tierDiff;
          return a.displayOrder - b.displayOrder;
        case "visitors":
          return b._count.visits - a._count.visits;
        case "name":
          return a.name.localeCompare(b.name);
        case "staff":
          const aOnline = a.staffPresence.some((s) => s.status === "ONLINE")
            ? 1
            : 0;
          const bOnline = b.staffPresence.some((s) => s.status === "ONLINE")
            ? 1
            : 0;
          return bOnline - aOnline;
        default:
          return 0;
      }
    });

    return result;
  }, [booths, searchQuery, selectedCategory, selectedTiers, sortBy, showOnlineOnly]);

  // Toggle tier filter
  const toggleTier = useCallback((tier: BoothTier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTiers([]);
    setShowOnlineOnly(false);
  }, []);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedTiers.length > 0 ||
    showOnlineOnly;

  return (
    <div className="flex flex-col h-full">
      {/* Search and filters bar */}
      <div className="flex flex-col gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search booths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category select */}
          <Select
            value={selectedCategory || "all"}
            onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tier filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(Object.keys(BOOTH_TIER_CONFIG) as BoothTier[]).map((tier) => (
                <DropdownMenuCheckboxItem
                  key={tier}
                  checked={selectedTiers.includes(tier)}
                  onCheckedChange={() => toggleTier(tier)}
                >
                  <Badge
                    variant="outline"
                    className={`${BOOTH_TIER_CONFIG[tier].bgColor} ${BOOTH_TIER_CONFIG[tier].color}`}
                  >
                    {BOOTH_TIER_CONFIG[tier].label}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuCheckboxItem
                checked={showOnlineOnly}
                onCheckedChange={setShowOnlineOnly}
              >
                Online staff only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort select */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tier">By Tier</SelectItem>
              <SelectItem value="visitors">By Visitors</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="staff">By Staff</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTiers.map((tier) => (
              <Badge
                key={tier}
                variant="secondary"
                className={`gap-1 ${BOOTH_TIER_CONFIG[tier].bgColor} ${BOOTH_TIER_CONFIG[tier].color}`}
              >
                {BOOTH_TIER_CONFIG[tier].label}
                <button
                  onClick={() => toggleTier(tier)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            {showOnlineOnly && (
              <Badge variant="secondary" className="gap-1">
                Online only
                <button
                  onClick={() => setShowOnlineOnly(false)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 text-sm text-muted-foreground border-b">
        {filteredBooths.length} booth{filteredBooths.length !== 1 ? "s" : ""} found
      </div>

      {/* Booth grid */}
      <ScrollArea className="flex-1">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
              : "flex flex-col gap-3 p-4"
          }
        >
          {filteredBooths.map((booth) => (
            <ExpoBoothCard
              key={booth.id}
              booth={booth}
              onClick={onBoothClick}
              isSelected={booth.id === selectedBoothId}
            />
          ))}

          {filteredBooths.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>No booths found matching your criteria.</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
