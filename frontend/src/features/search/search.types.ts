export interface KanoonDoc {
  doc_id: string;
  title: string;
  court: string;
  date: string;
  citation: string;
  headline: string;
}

export interface KanoonSearchResponse {
  query: string;
  total: number;
  page: number;
  results: KanoonDoc[];
}
