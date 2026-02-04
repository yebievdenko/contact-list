import { useCallback, useEffect, useRef, useState } from "react";
import { apiData, BATCH_SIZE } from "../api";
import type { Contact } from "../types/contact";

export type FetchPhase = "initial" | "more";

export type FetchError = {
  phase: FetchPhase;
  message: string;
} | null;

type UseContactsPaginationResult = {
  contacts: Contact[];
  error: FetchError;
  fetchNextBatch: (phase: FetchPhase) => Promise<void>;
  hasMore: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
};

export function useContactsPagination(): UseContactsPaginationResult {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<FetchError>(null);
  const [hasMore, setHasMore] = useState(true);
  const inFlightRef = useRef(false);
  const hasFetchedInitialRef = useRef(false);

  const fetchNextBatch = useCallback(
    async (phase: FetchPhase) => {
      if (inFlightRef.current) return;
      if (phase === "more" && !hasMore) return;

      if (phase === "initial") setIsInitialLoading(true);
      else setIsLoadingMore(true);

      inFlightRef.current = true;
      setError(null);

      try {
        const nextBatch = await apiData();

        setContacts((previousContacts) => [...previousContacts, ...nextBatch]);
        setHasMore(nextBatch.length === BATCH_SIZE);
      } catch (caughtError: unknown) {

        setError({
          phase,
          message:
            caughtError instanceof Error ? caughtError.message : "Unexpected error",
        });
      } finally {
        inFlightRef.current = false;
        if (phase === "initial") setIsInitialLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [hasMore]
  );

  useEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;
    void fetchNextBatch("initial");
  }, [fetchNextBatch]);

  return {
    contacts,
    error,
    fetchNextBatch,
    hasMore,
    isInitialLoading,
    isLoadingMore,
  };
}
