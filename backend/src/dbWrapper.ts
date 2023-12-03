import sqlite3 from "sqlite3";

export class InMemoryDB {
  db: sqlite3.Database;

  constructor(filePath: string) {
    this.db = new sqlite3.Database(filePath, (err) => {
      if (err) {
        console.error("Error opening in-memory SQLite database", err);
      } else {
        console.log("Connected to the in-memory SQLite database.");
      }
    });
  }

  async query(sql: string, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing the database", err);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
}
