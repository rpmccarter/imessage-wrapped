import sqlite3 from "sqlite3";
import fs from "fs";

export class InMemoryDB {
  db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        console.error("Error opening in-memory SQLite database", err);
      } else {
        console.log("Connected to the in-memory SQLite database.");
      }
    });
  }

  loadDatabaseFromFile(filePath: string) {
    const fileBuffer = fs.readFileSync(filePath);
    this.db.serialize(() => {
      this.db.exec("BEGIN TRANSACTION;");
      this.db.exec(fileBuffer.toString());
      this.db.exec("COMMIT;", (err) => {
        if (err) {
          console.error("Error loading data into in-memory database", err);
        } else {
          console.log("Database loaded successfully.");
        }
      });
    });
  }

  query(sql: string, params = []) {
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
