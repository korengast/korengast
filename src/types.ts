export interface TestCase {
  id: string;
  name: string;
  description: string;
  input: string;
  expectedBehaviors: string[];
  category: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  scorer: (output: string, testCase: TestCase) => number;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  model: string;
}

export interface TestResult {
  id: string;
  testCaseId: string;
  agentId: string;
  agentName: string;
  output: string;
  scores: Record<string, number>;
  averageScore: number;
  timestamp: Date;
  executionTimeMs: number;
}

export interface RunSummary {
  id: string;
  agentName: string;
  testCount: number;
  averageScore: number;
  scores: Record<string, number>;
  categoryScores: Record<string, number>;
  timestamp: Date;
}
