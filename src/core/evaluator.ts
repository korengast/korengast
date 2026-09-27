import Anthropic from "@anthropic-ai/sdk";
import { TestCase, AgentConfig, TestResult, EvaluationCriteria } from "../types.js";

export class AgentEvaluator {
  private client: Anthropic;
  private testCount = 0;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async runTest(
    testCase: TestCase,
    agent: AgentConfig,
    criteria: EvaluationCriteria[]
  ): Promise<TestResult> {
    const startTime = Date.now();

    const message = await this.client.messages.create({
      model: agent.model,
      max_tokens: 1024,
      system: agent.systemPrompt,
      messages: [
        {
          role: "user",
          content: testCase.input,
        },
      ],
    });

    const output =
      message.content[0].type === "text" ? message.content[0].text : "";
    const executionTimeMs = Date.now() - startTime;

    const scores: Record<string, number> = {};
    for (const criterion of criteria) {
      scores[criterion.id] = criterion.scorer(output, testCase);
    }

    const averageScore =
      Object.values(scores).reduce((a, b) => a + b, 0) / criteria.length;

    return {
      id: `test-${this.testCount++}-${Date.now()}`,
      testCaseId: testCase.id,
      agentId: agent.name,
      agentName: agent.name,
      output,
      scores,
      averageScore,
      timestamp: new Date(),
      executionTimeMs,
    };
  }

  async runSuite(
    testCases: TestCase[],
    agent: AgentConfig,
    criteria: EvaluationCriteria[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTest(testCase, agent, criteria);
      results.push(result);
      console.log(
        `✓ ${testCase.name}: ${result.averageScore.toFixed(2)}/1.00`
      );
    }

    return results;
  }
}
