# Agent Eval Suite

A comprehensive evaluation framework for testing and benchmarking Claude agents. This tool helps you systematically evaluate agent performance across different prompts, models, and use cases.

## 🎯 Features

- **Multi-Agent Evaluation**: Test multiple agents simultaneously across the same test suite
- **Flexible Scoring**: Built-in evaluation criteria (completeness, clarity, conciseness, accuracy, relevance) plus custom scorers
- **Result Storage**: SQLite database for historical tracking and analysis
- **Web Dashboard**: Real-time visualization of agent performance metrics
- **Category Analysis**: Group tests by category and see per-category scores
- **Execution Metrics**: Track response times and performance characteristics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- An Anthropic API key (set as `ANTHROPIC_API_KEY`)

### Installation

```bash
npm install
npm run build
```

### Run Evaluation

```bash
npm run dev -- src/examples/basicExample.ts
```

This runs the basic example which evaluates two agents ("thoughtful" vs "concise") across multiple test cases.

### View Results

```bash
npm run dashboard
```

Open `http://localhost:3000` to see the interactive dashboard with all evaluation results.

## 📊 Architecture

```
┌─────────────────────────────────────┐
│         Test Cases & Agents         │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Evaluator   │
        │  (Anthropic) │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   Criteria   │
        │  Scorers     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Database    │
        │  (SQLite)    │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Dashboard   │
        │  (Express)   │
        └──────────────┘
```

## 📝 Creating Custom Test Suites

### 1. Define Test Cases

```typescript
import { TestCase } from "./src/types";

const myTests: TestCase[] = [
  {
    id: "unique-id",
    name: "Test Name",
    description: "What is this testing?",
    input: "The prompt to send to the agent",
    expectedBehaviors: [
      "should mention X",
      "should avoid Y",
      "should include Z",
    ],
    category: "your-category",
  },
];
```

### 2. Define Evaluation Criteria

```typescript
import { EvaluationCriteria } from "./src/types";

const customCriteria: EvaluationCriteria = {
  id: "domain-specific",
  name: "Domain Specific Knowledge",
  description: "Does it demonstrate domain expertise?",
  scorer: (output: string, testCase: TestCase) => {
    // Your custom scoring logic
    // Return a score between 0 and 1
    return output.includes("technical-term") ? 1.0 : 0.5;
  },
};
```

### 3. Configure Agents

```typescript
import { AgentConfig } from "./src/types";

const agents: AgentConfig[] = [
  {
    name: "my-agent",
    systemPrompt: "Custom system prompt here",
    model: "claude-3-5-sonnet-20241022",
  },
];
```

### 4. Run Evaluation

```typescript
import { AgentEvaluator } from "./src/core/evaluator";
import { Database } from "./src/storage/database";

const evaluator = new AgentEvaluator();
const db = new Database("./my-results.db");

const results = await evaluator.runSuite(
  myTests,
  agents[0],
  [customCriteria, ...Object.values(builtInCriteria)]
);

for (const result of results) {
  await db.saveTestResult(result);
}
```

## 🎨 Built-in Criteria

- **Completeness**: Does the output address all aspects of the input?
- **Clarity**: Is the response clear and well-structured?
- **Conciseness**: Does it avoid unnecessary verbosity?
- **Factual Accuracy**: Does it avoid obvious errors or contradictions?
- **Relevance**: Does the output stay focused on the query?

Each criterion scores from 0.0 to 1.0, with the final score being the average across all criteria.

## 📡 API Endpoints

### `GET /api/stats`

Returns aggregated statistics for all agents:

```json
[
  {
    "agent": "agent-name",
    "testCount": 42,
    "averageScore": 0.85,
    "minScore": 0.72,
    "maxScore": 0.98
  }
]
```

### `GET /api/results?agent=agent-name`

Returns detailed test results. Omit `agent` parameter to get all results.

```json
[
  {
    "id": "test-id",
    "testCaseId": "case-1",
    "agentName": "my-agent",
    "output": "Agent response text",
    "scores": { "completeness": 0.9, "clarity": 0.85 },
    "averageScore": 0.875,
    "timestamp": "2024-01-15T10:30:00Z",
    "executionTimeMs": 1250
  }
]
```

## 🔍 Use Cases

### Model Selection

Evaluate different Claude models to choose the best for your use case:

```typescript
const agents = [
  { name: "opus", model: "claude-3-opus-20250219", systemPrompt: "..." },
  { name: "sonnet", model: "claude-3-5-sonnet-20241022", systemPrompt: "..." },
];
```

### Prompt Engineering

Compare different system prompts to find the most effective one:

```typescript
const agents = [
  { name: "detailed", systemPrompt: "Be extremely detailed...", ... },
  { name: "concise", systemPrompt: "Be brief and concise...", ... },
];
```

### Regression Testing

Track agent behavior over time as you iterate on prompts:

```typescript
// Run evaluations periodically
// Dashboard shows trends and regressions
```

### Domain-Specific Evaluation

Create custom criteria for specialized domains:

```typescript
const medicalCriteria = {
  id: "medical-accuracy",
  scorer: (output) => {
    // Check for medical terminology, disclaimer requirements, etc.
  },
};
```

## 🛠️ Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Project Structure

```
src/
├── core/
│   └── evaluator.ts        # Main evaluation engine
├── storage/
│   └── database.ts         # Result storage
├── criteria/
│   └── builtIn.ts          # Default scoring criteria
├── dashboard/
│   ├── server.ts           # Express server
│   └── public/index.html   # Web dashboard
├── examples/
│   └── basicExample.ts     # Example usage
└── types.ts                # TypeScript types
```

## 📈 Dashboard Features

- **Real-time Statistics**: View aggregated scores per agent
- **Detailed Results**: See individual test runs with scores
- **Agent Filtering**: Filter results by specific agents
- **Auto-refresh**: Dashboard updates every 5 seconds
- **Performance Tracking**: View execution times for each test

## 🤝 Integration with CI/CD

Track agent performance as part of your pipeline:

```bash
# In your CI workflow
npm run build
ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }} npm run dev
```

Then query `/api/stats` to fail the build if scores drop below a threshold.

## 🚀 Advanced Features

### Custom Scoring Logic

Implement arbitrarily complex scoring:

```typescript
const semanticSimilarity: EvaluationCriteria = {
  id: "semantic-match",
  scorer: async (output, testCase) => {
    // Call external APIs, use ML models, etc.
    // Return score between 0 and 1
  },
};
```

### Batch Evaluations

Run multiple evaluation suites and compare results:

```typescript
const suites = ["suite-1", "suite-2", "suite-3"];
for (const suite of suites) {
  // Load suite
  // Run evaluation
  // Store results
}
```

### Export Results

Access the SQLite database directly for custom analysis:

```bash
sqlite3 eval-results.db
SELECT * FROM test_results WHERE timestamp > '2024-01-15';
```

## 📊 Understanding Scores

Scores range from 0.0 to 1.0:

- **0.9-1.0**: Excellent - meets all expectations
- **0.7-0.9**: Good - mostly meets expectations
- **0.5-0.7**: Fair - partially meets expectations
- **0.2-0.5**: Poor - significant issues
- **0.0-0.2**: Failing - does not meet expectations

The final score for each test is the average across all evaluation criteria.

## 🔐 Security Considerations

- Keep your `ANTHROPIC_API_KEY` secure
- The dashboard runs locally by default
- Results are stored in a local SQLite database
- No data is sent to external services beyond Anthropic

## 📝 Current Interests

This project aligns with my focus on:

- **Multi-agent orchestration** - Framework for coordinating agent evaluation
- **Agent evaluation** - Systematic assessment of agent behavior
- **Catching silent failures** - Criteria designed to catch agents "doing the wrong thing"

## 🎯 Future Enhancements

- [ ] Distributed evaluation for large test suites
- [ ] Comparative analysis visualization
- [ ] Integration with evaluation frameworks (RAGAS, etc.)
- [ ] Custom criterion builder UI
- [ ] Time-series analysis and trend detection
- [ ] Automated regression detection
- [ ] Integration with GitHub Actions

---

Built with focus on evaluation that catches agents quietly doing the wrong thing.

[LinkedIn](https://www.linkedin.com/in/korengast)
