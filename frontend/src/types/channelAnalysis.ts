export type MetricLevel = 'high' | 'medium' | 'low';

export interface MetricsLevels {
  subscribers_to_views: MetricLevel[];
  views_to_likes: MetricLevel[];
  views_to_comments: MetricLevel[];
}

export interface Metrics {
  subscribers_to_views: MetricLevel;
  views_to_likes: MetricLevel;
  views_to_comments: MetricLevel;
}

export interface Cause {
  title: string;
  description: string;
}

export interface DetailedAnalysis {
  views_analysis: string;
  likes_analysis: string;
  comments_analysis: string;
}

export interface Analysis {
  interpretation: string;
  causes: Cause[];
  detailed_analysis?: DetailedAnalysis;
}

export interface Strategy {
  title: string;
  actions: string[];
}

export interface Recommendations {
  strategy: Strategy[];
}

export interface AnalysisCase {
  case_id: string;
  metrics: Metrics;
  analysis: Analysis;
  recommendations: Recommendations;
}

export interface ChannelAnalysisCases {
  version: string;
  channel_analysis_cases: {
    metrics_levels: MetricsLevels;
    cases: AnalysisCase[];
  };
}

// 성과 등급을 MetricLevel로 변환하는 함수
export function convertGradeToMetricLevel(grade: string): MetricLevel {
  switch (grade) {
    case '우수':
      return 'high';
    case '적정':
      return 'medium';
    case '미달':
      return 'low';
    default:
      return 'low';
  }
}

// case_id를 생성하는 함수
export function generateCaseId(metrics: Metrics): string {
  return Object.values(metrics)
    .map(level => level.charAt(0).toUpperCase())
    .join('');
}

// 성과 지표에 따른 분석 케이스를 찾는 함수
export function findAnalysisCase(cases: AnalysisCase[], metrics: Metrics): AnalysisCase | undefined {
  const caseId = generateCaseId(metrics);
  return cases.find(c => c.case_id === caseId);
} 