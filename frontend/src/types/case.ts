export interface CaseDetail {
  tid: number;
  title: string;
  doc: string; // The full judgment HTML/Text
  author: string;
  publishdate: string;
  docsource: string;
  citation?: string;
  num_cites?: number;
  num_citedby?: number;
  court?: string;
}

export interface CaseSummary {
  plain_summary: string;
  key_issues: string[];
  holding: string;
  area_of_law: string[];
  significance: string;
}
