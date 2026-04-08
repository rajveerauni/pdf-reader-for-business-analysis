export type ChangeInsight = {
  area: string;
  whatChanged: string;
  impact: string;
};

export type Insights = {
  summary: string;
  revenue: string[];
  growth: string[];
  risks: string[];
  opportunities: string[];
  changes: ChangeInsight[];
  strengths: string[];
  improvements: string[];
  pros: string[];
  cons: string[];
  actionPlan: string[];
  confidence: number;
};

export type AnalyzeResponse = {
  insights: Insights;
};

export type QaCitation = {
  pageNumber?: number;
  quote: string;
  reason: string;
};

export type QaResponse = {
  qa: {
    answer: string;
    citations: QaCitation[];
    followUps: string[];
    confidence: number;
  };
};
