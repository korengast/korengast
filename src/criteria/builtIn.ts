import { EvaluationCriteria, TestCase } from "../types.js";

export const builtInCriteria: Record<string, EvaluationCriteria> = {
  completeness: {
    id: "completeness",
    name: "Completeness",
    description: "Does the output address all aspects of the input?",
    scorer: (output: string, testCase: TestCase) => {
      const outputLower = output.toLowerCase();
      const behaviors = testCase.expectedBehaviors;
      const matches = behaviors.filter((b) =>
        outputLower.includes(b.toLowerCase())
      ).length;
      return Math.min(1, matches / Math.max(1, behaviors.length));
    },
  },

  clarity: {
    id: "clarity",
    name: "Clarity",
    description: "Is the response clear and well-structured?",
    scorer: (output: string) => {
      const sentences = output.split(/[.!?]+/).filter((s) => s.trim().length);
      const avgLength =
        output.length / Math.max(1, sentences.length);
      const tooLong = avgLength > 200;
      const tooShort = avgLength < 20;
      if (tooLong || tooShort) return 0.5;
      return 1.0;
    },
  },

  conciseness: {
    id: "conciseness",
    name: "Conciseness",
    description: "Does it avoid unnecessary verbosity?",
    scorer: (output: string) => {
      const wordCount = output.split(/\s+/).length;
      if (wordCount < 10) return 0.3;
      if (wordCount > 500) return 0.5;
      return 1.0;
    },
  },

  factualAccuracy: {
    id: "factualAccuracy",
    name: "Factual Accuracy",
    description: "Does it avoid obvious errors or contradictions?",
    scorer: (output: string) => {
      const contradictions = (output.match(/but|however|actually/gi) || [])
        .length;
      if (contradictions > 3) return 0.6;
      return 0.9;
    },
  },

  relevance: {
    id: "relevance",
    name: "Relevance",
    description: "Does the output stay focused on the query?",
    scorer: (output: string, testCase: TestCase) => {
      const queryWords = testCase.input
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const matches = queryWords.filter((w) =>
        output.toLowerCase().includes(w.toLowerCase())
      ).length;
      return Math.min(1, matches / Math.max(1, queryWords.length * 0.3));
    },
  },
};
