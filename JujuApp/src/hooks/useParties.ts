import { useState, useCallback, useEffect, useRef } from 'react';
import { partyApi } from '../api/party';
import { Party } from '../types';

interface UsePartiesOptions {
  pageSize?: number;
  initialCategory?: string;
}

interface UsePartiesReturn {
  parties: Party[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  page: number;
  activeCategory: string;
  searchQuery: string;
  initialLoading: boolean;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  fetchParties: (pageNum?: number, reset?: boolean) => Promise<void>;
  onRefresh: () => void;
  loadMore: () => void;
}

export const useParties = ({
  pageSize = 20,
  initialCategory = 'all',
}: UsePartiesOptions = {}): UsePartiesReturn => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);
  const categoryRef = useRef(activeCategory);
  const searchRef = useRef(searchQuery);

  useEffect(() => {
    categoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    searchRef.current = searchQuery;
  }, [searchQuery]);

  const fetchParties = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loadingRef.current && !reset) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const currentCategory = categoryRef.current;
        const currentSearch = searchRef.current;
        const params = {
          page: pageNum,
          pageSize,
          ...(currentCategory !== 'all' && { category: currentCategory }),
          ...(currentSearch.trim() && { keyword: currentSearch.trim() }),
        };

        const res = (await partyApi.getParties(params)) as unknown as {
          success: boolean;
          data?: Party[] | { list: Party[] };
          message?: string;
        };
        if (res.success) {
          const newParties = Array.isArray(res.data) ? res.data : (res.data?.list || []);
          setParties(prev => (reset ? newParties : [...prev, ...newParties]));
          setHasMore(newParties.length >= pageSize);
          if (reset) setPage(1);
        } else {
          console.error(res.message || '获取数据失败');
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchParties(1, true);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      const debounceTimer = setTimeout(() => {
        fetchParties(1, true);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [activeCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParties(1, true);
  }, [fetchParties]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchParties(page + 1, false);
      setPage(p => p + 1);
    }
  }, [loading, hasMore, page, fetchParties]);

  const handleSetCategory = useCallback((category: string) => {
    if (categoryRef.current !== category) {
      setActiveCategory(category);
      setSearchQuery('');
    }
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    parties,
    loading,
    refreshing,
    hasMore,
    page,
    activeCategory,
    searchQuery,
    initialLoading,
    setActiveCategory: handleSetCategory,
    setSearchQuery: handleSetSearchQuery,
    fetchParties,
    onRefresh,
    loadMore,
  };
};

export default useParties;
