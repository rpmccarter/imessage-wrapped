import initSqlJs, { Database } from 'sql.js';

export class InMemoryDB {
  constructor(private db: Database) {}

  static async create(chatFile: File): Promise<InMemoryDB> {
    const db = await InMemoryDB.loadDB(chatFile);
    return new InMemoryDB(db);
  }

  private static async loadDB(file: File) {
    return new Promise<Database>(async (resolve, reject) => {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result === null || typeof reader.result === 'string') {
          return reject('unable to parse file');
        }
        const Uints = new Uint8Array(reader.result);
        return resolve(new SQL.Database(Uints));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async query(sql: string) {
    return this.db.exec(sql);
  }
}
