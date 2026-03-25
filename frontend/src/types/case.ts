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
  precedent_status?: 'Good Law' | 'Overruled' | 'Distinguished' | 'Landmark';
  status_reason?: string;
}

export interface TimelineEvent {
  year: number;
  case_name: string;
  docid: string | null;
  one_line: string;
  status: string;
}

export interface CaseTimeline {
  legal_issue: string;
  timeline: TimelineEvent[];
  current_case_status: string;
  status_reason: string;
}
