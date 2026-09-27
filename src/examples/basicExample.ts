import { AgentEvaluator } from "../core/evaluator.js";
import { Database } from "../storage/database.js";
import { builtInCriteria } from "../criteria/builtIn.js";
import { TestCase, AgentConfig, RunSummary } from "../types.js";

const testCases: TestCase[] = [
  {
    id: "writing-1",
    name: "Essay Writing",
    description: "Can the agent write a coherent essay?",
    input: "Write a short essay about the impact of artificial intelligence on society.",
    expectedBehaviors: [
      "discusses benefits",
      "mentions challenges",
      "provides examples",
    ],
    category: "writing",
  },
  {
    id: "math-1",
    name: "Mathematical Reasoning",
    description: "Can the agent solve math problems?",
    input: "If a train travels at 60 mph for 2.5 hours, how far does it go?",
    expectedBehaviors: ["calculation", "miles", "150"],
    category: "math",
  },
  {
    id: "coding-1",
    name: "Code Generation",
    description: "Can the agent write simple code?",
    input:
      "Write a Python function that returns the factorial of a number using recursion.",
    expectedBehaviors: ["def", "return", "recursion", "factor"],
    category: "coding",
  },
];

const agents: AgentConfig[] = [
  {
    name: "thoughtful-assistant",
    systemPrompt:
      "You are a thoughtful AI assistant. Take your time to think through problems carefully before responding. Provide detailed, well-reasoned answers.",
    model: "claude-3-5-sonnet-20241022",
  },
  {
    name: "concise-assistant",
    systemPrompt:
      "You are a concise AI assistant. Provide direct, to-the-point answers without unnecessary elaboration. Be efficient in your responses.",
    model: "claude-3-5-sonnet-20241022",
  },
];

async function main() {
  const evaluator = new AgentEvaluator();
  const db = new Database("./eval-results.db");

  console.log("🧪 Starting Agent Evaluation Suite\n");

  for (const agent of agents) {
    console.log(`\n📋 Evaluating agent: ${agent.name}`);
    console.log("─".repeat(50));

    const results = await evaluator.runSuite(
      testCases,
      agent,
      Object.values(builtInCriteria)
    );

    for (const result of results) {
      await db.saveTestResult(result);
    }

    const categoryScores: Record<string, number[]> = {};
    for (const result of results) {
      const testCase = testCases.find((t) => t.id === result.testCaseId)!;
      if (!categoryScores[testCase.category]) {
        categoryScores[testCase.category] = [];
      }
      categoryScores[testCase.category].push(result.averageScore);
    }

    const avgCategoryScores: Record<string, number> = {};
    for (const [category, scores] of Object.entries(categoryScores)) {
      avgCategoryScores[category] =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    const overallScore =
      results.reduce((a, b) => a + b.averageScore, 0) / results.length;

    const summary: RunSummary = {
      id: `run-${agent.name}-${Date.now()}`,
      agentName: agent.name,
      testCount: results.length,
      averageScore: overallScore,
      scores: Object.fromEntries(
        Object.values(builtInCriteria).map((c) => [
          c.id,
          results.reduce((a, b) => a + b.scores[c.id], 0) / results.length,
        ])
      ),
      categoryScores: avgCategoryScores,
      timestamp: new Date(),
    };

    await db.saveRunSummary(summary);

    console.log(`\n📊 Summary for ${agent.name}:`);
    console.log(`  Overall Score: ${(overallScore * 100).toFixed(1)}%`);
    console.log(`  Category Scores:`);
    for (const [category, score] of Object.entries(avgCategoryScores)) {
      console.log(`    ${category}: ${(score * 100).toFixed(1)}%`);
    }
  }

  console.log("\n✅ Evaluation complete!");
  console.log("📊 View results: npm run dashboard");

  await db.close();
}

main().catch(console.error);
