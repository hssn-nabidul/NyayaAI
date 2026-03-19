export interface SearchResult {
  doc_id: string;
  title: string;
  court: string;
  date: string;
  citation: string;
  headline: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  page: number;
  results: SearchResult[];
}

export interface ApiErrorResponse {
  detail: string;
  code?: string;
  timestamp?: string;
}
