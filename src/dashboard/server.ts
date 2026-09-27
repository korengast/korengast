import express from "express";
import { Database } from "../storage/database.js";

const app = express();
const db = new Database("./eval-results.db");

app.use(express.json());
app.use(express.static("src/dashboard/public"));

app.get("/api/results", async (req, res) => {
  try {
    const agent = req.query.agent as string | undefined;
    const results = await db.getTestResults(agent);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const results = await db.getTestResults();
    const agents = new Map<string, number[]>();

    for (const result of results) {
      if (!agents.has(result.agentName)) {
        agents.set(result.agentName, []);
      }
      agents.get(result.agentName)!.push(result.averageScore);
    }

    const stats = Array.from(agents.entries()).map(([name, scores]) => ({
      agent: name,
      testCount: scores.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📊 Dashboard running at http://localhost:${PORT}`);
});
