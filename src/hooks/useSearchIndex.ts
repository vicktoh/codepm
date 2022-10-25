import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { algoliaIndex } from "../services/algolia";

export function useSearchIndex<T>(index: string, initialFilter?: string) {
  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<string>(initialFilter || "");
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageStat, setpageStats] = useState<{
    total: number;
    pages: number;
    currentPage: number;
  }>();
  const [data, setData] = useState<T>();
  const toast = useToast();

  useEffect(() => {
    async function searchIndex() {
      try {
        setLoading(true);
        const usersIndex = algoliaIndex(index);
        const response = await usersIndex.search(query, {
          page,
          hitsPerPage: 10,
          ...(filters ? { filters } : null),
        });
        const { hits, nbHits, page: currentPage, nbPages } = response;
        setData(hits as any);
        setpageStats({
          total: nbHits,
          pages: nbPages,
          currentPage: currentPage,
        });
        setPage(currentPage);
      } catch (error) {
        const err: any = error;
        toast({
          title: `Unable to fetch the ${index}`,
          description: err?.message || "Unknown Error",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    searchIndex();
  }, [page, query, toast, index, filters]);

  return {
    page,
    setPage,
    pageStat,
    loading,
    setQuery,
    setFilters,
    data,
    setData,
  };
}