import { InMemoryDB } from "./dbWrapper";

interface QueryResultA {}

interface QueryResultB {}

export class QueryManager {
  private db: InMemoryDB;

  constructor(db: InMemoryDB) {
    this.db = db;
  }

  async runQueries(): Promise<{
    resultA: QueryResultA[];
    resultB: QueryResultB[];
  }> {
    const resultA = (await this.db.query(
      "SELECT ... FROM ..."
    )) as QueryResultA[];
    const resultB = (await this.db.query(
      "SELECT ... FROM ..."
    )) as QueryResultB[];

    return { resultA, resultB };
  }
}
