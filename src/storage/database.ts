import sqlite3 from "sqlite3";
import { TestResult, RunSummary } from "../types.js";

export class Database {
  private db: sqlite3.Database;

  constructor(filename: string = ":memory:") {
    this.db = new sqlite3.Database(filename);
    this.initialize();
  }

  private initialize() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS test_results (
          id TEXT PRIMARY KEY,
          testCaseId TEXT,
          agentId TEXT,
          agentName TEXT,
          output TEXT,
          scores JSON,
          averageScore REAL,
          timestamp DATETIME,
          executionTimeMs INTEGER
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS run_summaries (
          id TEXT PRIMARY KEY,
          agentName TEXT,
          testCount INTEGER,
          averageScore REAL,
          scores JSON,
          categoryScores JSON,
          timestamp DATETIME
        )
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_agent_name
        ON test_results(agentName)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_timestamp
        ON test_results(timestamp)
      `);
    });
  }

  saveTestResult(result: TestResult): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        INSERT INTO test_results
        (id, testCaseId, agentId, agentName, output, scores, averageScore, timestamp, executionTimeMs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          result.id,
          result.testCaseId,
          result.agentId,
          result.agentName,
          result.output,
          JSON.stringify(result.scores),
          result.averageScore,
          result.timestamp.toISOString(),
          result.executionTimeMs,
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  getTestResults(agentName?: string): Promise<TestResult[]> {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM test_results";
      const params: string[] = [];

      if (agentName) {
        query += " WHERE agentName = ?";
        params.push(agentName);
      }

      query += " ORDER BY timestamp DESC LIMIT 100";

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) reject(err);
        else
          resolve(
            rows.map((row) => ({
              ...row,
              scores: JSON.parse(row.scores),
              timestamp: new Date(row.timestamp),
            }))
          );
      });
    });
  }

  saveRunSummary(summary: RunSummary): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        INSERT INTO run_summaries
        (id, agentName, testCount, averageScore, scores, categoryScores, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          summary.id,
          summary.agentName,
          summary.testCount,
          summary.averageScore,
          JSON.stringify(summary.scores),
          JSON.stringify(summary.categoryScores),
          summary.timestamp.toISOString(),
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
