/**
 * Custom hook for making API calls with loading and error states
 * Provides automatic loading management and error handling
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  get: (path: string) => Promise<T | null>;
  post: (path: string, body: any) => Promise<T | null>;
  put: (path: string, body: any) => Promise<T | null>;
  patch: (path: string, body: any) => Promise<T | null>;
  delete: (path: string) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing API state and calls
 * Usage:
 *   const { data, error, loading, get } = useApi<User>();
 *   const user = await get('/api/user');
 */
export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const makeRequest = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      path: string,
      body?: any
    ): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      let response: ApiResponse<T>;

      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(path);
          break;
        case 'POST':
          response = await apiClient.post<T>(path, body);
          break;
        case 'PUT':
          response = await apiClient.put<T>(path, body);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(path, body);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(path);
          break;
      }

      if (response.error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.error!,
        }));
        return null;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        data: response.data || null,
      }));

      return response.data || null;
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    ...state,
    get: (path: string) => makeRequest('GET', path),
    post: (path: string, body: any) => makeRequest('POST', path, body),
    put: (path: string, body: any) => makeRequest('PUT', path, body),
    patch: (path: string, body: any) => makeRequest('PATCH', path, body),
    delete: (path: string) => makeRequest('DELETE', path),
    reset,
  };
}
