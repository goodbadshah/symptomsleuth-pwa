"use client";

import { useState, useEffect, useRef } from "react";
import { useAppState } from "@/app/providers";
import type { ConditionAggregate } from "@/utils/community";

// ─── Module-level memory cache ─────────────────────────────────────────────
// Persists across component mount/unmount cycles within the same page session.

interface CacheEntry {
  data: ConditionAggregate | null;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CommunityData {
  /** Aggregates keyed by condition name. null = below threshold or unavailable. */
  aggregates: Map<string, ConditionAggregate | null>;
  loading: boolean;
  error: string | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Fetches condition aggregates for every condition the user tracks.
 * Caches in module memory and refetches on mount if older than 24 hours.
 */
export function useCommunity(): CommunityData {
  const { state } = useAppState();
  const conditions = state.profile.conditions;

  const [communityData, setCommunityData] = useState<CommunityData>(() => {
    // Seed from cache on first render so we don't flash a loader if data exists
    const aggregates = new Map<string, ConditionAggregate | null>();
    for (const c of conditions) {
      const hit = memoryCache.get(c);
      if (hit) aggregates.set(c, hit.data);
    }
    return { aggregates, loading: false, error: null };
  });

  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (conditions.length === 0) return;

    const staleConditions = conditions.filter((c) => {
      const hit = memoryCache.get(c);
      return !hit || Date.now() - hit.fetchedAt > CACHE_TTL_MS;
    });

    if (staleConditions.length === 0) {
      // Everything is fresh - serve from cache
      const aggregates = new Map<string, ConditionAggregate | null>();
      for (const c of conditions) {
        aggregates.set(c, memoryCache.get(c)?.data ?? null);
      }
      setCommunityData({ aggregates, loading: false, error: null });
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setCommunityData((prev) => ({ ...prev, loading: true, error: null }));

    const fetchAll = staleConditions.map(async (condition) => {
      try {
        const res = await fetch(
          `/api/community/aggregates?condition=${encodeURIComponent(condition)}`
        );
        const data = res.ok
          ? ((await res.json()) as ConditionAggregate | null)
          : null;
        memoryCache.set(condition, { data, fetchedAt: Date.now() });
        return [condition, data] as const;
      } catch {
        // Network failure - cache null so we don't hammer on every render
        memoryCache.set(condition, { data: null, fetchedAt: Date.now() });
        return [condition, null] as const;
      }
    });

    Promise.all(fetchAll)
      .then(() => {
        const aggregates = new Map<string, ConditionAggregate | null>();
        for (const c of conditions) {
          aggregates.set(c, memoryCache.get(c)?.data ?? null);
        }
        setCommunityData({ aggregates, loading: false, error: null });
      })
      .catch(() => {
        setCommunityData((prev) => ({
          ...prev,
          loading: false,
          error: "Community data unavailable",
        }));
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions.join(",")]);

  return communityData;
}
