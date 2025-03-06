export type ApiRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type ApiRequestParam = {
  key: string;
  value: string;
  enabled: boolean;
};

export type ApiRequestData = {
  url: string;
  method: ApiRequestMethod;
  headers: ApiRequestParam[];
  queryParams: ApiRequestParam[];
  body: string;
  retryCount: number;
};

export type ApiRequestResponse = {
  status: number;
  data: any;
  headers: Record<string, string>;
};

export type ApiRequestError = {
  status?: number;
  message: string;
  data?: any;
};
