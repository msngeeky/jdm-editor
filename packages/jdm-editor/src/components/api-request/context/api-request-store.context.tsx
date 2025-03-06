import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';

import type { ApiRequestData, ApiRequestParam } from '../types';

type ApiRequestStore = {
  url: string;
  method: ApiRequestData['method'];
  headers: ApiRequestParam[];
  queryParams: ApiRequestParam[];
  body: string;
  retryCount: number;
  setUrl: (url: string) => void;
  setMethod: (method: ApiRequestData['method']) => void;
  setHeaders: (headers: ApiRequestParam[]) => void;
  setQueryParams: (params: ApiRequestParam[]) => void;
  setBody: (body: string) => void;
  setRetryCount: (count: number) => void;
};

type ApiRequestStoreContext = {
  store: ReturnType<typeof createApiRequestStore>;
};

const ApiRequestContext = createContext<ApiRequestStoreContext | null>(null);

export const createApiRequestStore = (initialData?: Partial<ApiRequestData>) => {
  return createStore<ApiRequestStore>((set) => ({
    url: initialData?.url ?? '',
    method: initialData?.method ?? 'GET',
    headers: initialData?.headers ?? [],
    queryParams: initialData?.queryParams ?? [],
    body: initialData?.body ?? '',
    retryCount: initialData?.retryCount ?? 0,
    setUrl: (url) => set({ url }),
    setMethod: (method) => set({ method }),
    setHeaders: (headers) => set({ headers }),
    setQueryParams: (params) => set({ queryParams: params }),
    setBody: (body) => set({ body }),
    setRetryCount: (count) => set({ retryCount: count }),
  }));
};

export const ApiRequestProvider: React.FC<{
  children: React.ReactNode;
  store: ReturnType<typeof createApiRequestStore>;
}> = ({ children, store }) => {
  return (
    <ApiRequestContext.Provider value={{ store }}>
      {children}
    </ApiRequestContext.Provider>
  );
};

export const useApiRequestStore = <T,>(selector: (state: ApiRequestStore) => T): T => {
  const context = useContext(ApiRequestContext);
  if (!context) {
    throw new Error('useApiRequestStore must be used within ApiRequestProvider');
  }

  return useStore(context.store, selector);
};

export const useApiRequestStoreRaw = () => {
  const context = useContext(ApiRequestContext);
  if (!context) {
    throw new Error('useApiRequestStoreRaw must be used within ApiRequestProvider');
  }

  return context.store;
};
