import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { partyApi } from '../../api/party';
import type { Party as PartyType } from '../../types/api';
import type { ApiResponse, ListResponse } from '../../types';

export interface PartyListState {
  parties: PartyType[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  initialLoading: boolean;
  error: string | null;
}

export type PartyListAction =
  | { type: 'FETCH_START'; reset?: boolean }
  | { type: 'FETCH_SUCCESS'; data: PartyType[]; reset?: boolean }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'RESET' };

export const partyListReducer = (
  state: PartyListState,
  action: PartyListAction,
): PartyListState => {
  'worklet';
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
        refreshing: action.reset || false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        parties: action.reset
          ? action.data
          : [...state.parties, ...action.data],
        hasMore: action.data.length >= 20,
        loading: false,
        refreshing: false,
        initialLoading: false,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        error: action.error,
        loading: false,
        refreshing: false,
        initialLoading: false,
      };
    case 'RESET':
      return {
        ...state,
        parties: [],
        loading: false,
        refreshing: false,
        hasMore: true,
        error: null,
      };
    default:
      return state;
  }
};

export const initialPartyListState: PartyListState = {
  parties: [],
  loading: false,
  refreshing: false,
  hasMore: true,
  initialLoading: true,
  error: null,
};

export interface UsePartyListReturn extends PartyListState {
  onRefresh: () => void;
  loadMore: () => void;
  reset: () => void;
}

export const usePartyList = (
  activeCategory: string,
  searchQuery: string,
): UsePartyListReturn => {
  const [state, dispatch] = useReducer(partyListReducer, initialPartyListState);
  const [page, setPage] = useState(1);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const fetchParties = useCallback(
    async (pageNum: number, reset: boolean) => {
      if (state.loading && !reset) return;

      fetchControllerRef.current?.abort();
      fetchControllerRef.current = new AbortController();

      dispatch({ type: 'FETCH_START', reset });

      try {
        const params: {
          page: number;
          pageSize: number;
          category?: string;
          keyword?: string;
        } = {
          page: pageNum,
          pageSize: 20,
        };

        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }
        if (searchQuery.trim()) {
          params.keyword = searchQuery.trim();
        }

        const res = (await partyApi.getParties(params)) as unknown as ApiResponse<
          ListResponse<PartyType>
        >;

        if (res.success) {
          const newParties = Array.isArray(res.data) ? res.data : (res.data?.list || []);
          dispatch({ type: 'FETCH_SUCCESS', data: newParties, reset });
          if (reset) setPage(1);
        } else {
          dispatch({
            type: 'FETCH_ERROR',
            error: res.message || '获取数据失败',
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          dispatch({ type: 'FETCH_ERROR', error: '网络错误，请重试' });
        }
      }
    },
    [activeCategory, searchQuery, state.loading],
  );

  useEffect(() => {
    fetchParties(1, true);
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, [fetchParties]);

  const onRefresh = useCallback(() => {
    fetchParties(1, true);
  }, [fetchParties]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchParties(nextPage, false);
    }
  }, [state.loading, state.hasMore, page, fetchParties]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setPage(1);
    fetchParties(1, true);
  }, [fetchParties]);

  return {
    ...state,
    onRefresh,
    loadMore,
    reset,
  };
};
