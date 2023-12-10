import initSqlJs, { Database } from 'sql.js';
import * as emoji from 'emoji-regex';
import { tokenizeText } from './tokenizeText';
import {
  TextsSentSummary,
  TopSender,
  MonthOfYear,
  TopMonths,
  WordCount,
  UnbalancedFriend,
  ResultJawn,
} from './types';

export class QueryManager {
  map: Record<string, string> = {};

  constructor(private db: Database) {}

  static async create(chatFile: File): Promise<QueryManager> {
    const db = await QueryManager.loadDB(chatFile);
    return new QueryManager(db);
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

  private query(sql: string) {
    const stmt = this.db.prepare(sql);
    const results: unknown[] = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    return results;
  }

  close() {
    this.db.close();
  }

  static async runQueries(chatFile: File, contactFile?: File) {
    const queryManager = await QueryManager.create(chatFile);
    const results = queryManager.runQueries();
    queryManager.db.close();
    return results;
  }

  textSentSummary() {
    return this.query(
      `SELECT 
        COUNT(*) as total_texts_sent,
        MIN(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as first_text_date,
        MAX(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as last_text_date
      FROM message m
      WHERE is_from_me = 1
      AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'`,
    ) as TextsSentSummary[];
  }

  topSenders() {
    return this.query(
      `SELECT 
      h.id, 
      COUNT(*) as messages_sent
  FROM message m
  JOIN handle h ON m.handle_id = h.ROWID
  WHERE m.is_from_me = 1
  AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
  GROUP BY h.id
  ORDER BY messages_sent DESC
  LIMIT 10;`,
    ) as TopSender[];
  }

  topMonths() {
    const messagesPerMonthResult = this.query(
      `SELECT 
        CASE strftime('%m', datetime((m.date / 1000000000) + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime'))
          WHEN '01' THEN 'January'
          WHEN '02' THEN 'February'
          WHEN '03' THEN 'March'
          WHEN '04' THEN 'April'
          WHEN '05' THEN 'May'
          WHEN '06' THEN 'June'
          WHEN '07' THEN 'July'
          WHEN '08' THEN 'August'
          WHEN '09' THEN 'September'
          WHEN '10' THEN 'October'
          WHEN '11' THEN 'November'
          WHEN '12' THEN 'December'
        END as month_of_year,
        COUNT(*) as messages_sent
      FROM message m
        WHERE m.is_from_me = 1
        AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
      GROUP BY month_of_year
      ORDER BY messages_sent DESC;`,
    ) as { month_of_year: MonthOfYear; messages_sent: number }[];

    return Object.fromEntries(
      messagesPerMonthResult.map(({ month_of_year, messages_sent }) => [
        month_of_year,
        messages_sent,
      ]),
    ) as TopMonths;
  }

  topFriends() {
    const topFriendsRaw = this.query(`SELECT 
    h.id, 
    COUNT(*) as message_count
FROM message m
JOIN handle h ON m.handle_id = h.ROWID
WHERE 
    strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
    AND m.is_from_me = 1
GROUP BY h.id
ORDER BY message_count DESC
LIMIT 3;
`) as { id: string; message_count: number }[];

    return Object.fromEntries(
      topFriendsRaw.map(({ id, message_count }) => {
        const wordCounts = this.wordCountsForId(id);
        return [
          id,
          {
            message_count,
            top_word_count: wordCounts.wordCount,
            top_emojis: wordCounts.emojiCount,
          },
        ];
      }),
    );
  }

  private wordCountsForId(id: string) {
    const stmt = this.db.prepare(`
SELECT m.text 
FROM message m
JOIN handle h ON m.handle_id = h.ROWID
WHERE h.id = '${id}'
AND text NOTNULL;
    `);

    const rawWordCount: WordCount = {};
    const rawEmojiCount: WordCount = {};

    const emojiRegex = emoji.default();
    while (stmt.step()) {
      const msg = stmt.getAsObject() as { text: string };
      if (!msg.text) continue;
      tokenizeText(msg.text).forEach((word) => {
        rawWordCount[word] = (rawWordCount[word] || 0) + 1;
      });

      for (const match of msg.text.matchAll(emojiRegex)) {
        const emoji = match[0];
        rawEmojiCount[emoji] = (rawEmojiCount[emoji] || 0) + 1;
      }
    }

    const wordCount = Object.fromEntries(
      Object.entries(rawWordCount)
        .sort(([_a, countA], [_b, countB]) => countB - countA)
        .slice(0, 5), // Take the top 5 words
    );

    const emojiCount = Object.fromEntries(
      Object.entries(rawEmojiCount)
        .sort(([_a, countA], [_b, countB]) => countB - countA)
        .slice(0, 5), // Take the top 5 emojis
    );

    return {
      wordCount,
      emojiCount,
    };
  }

  unbalancedFriend() {
    return this.query(`SELECT 
    h.id, 
    SUM(CASE WHEN m.is_from_me = 1 THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN m.is_from_me = 0 THEN 1 ELSE 0 END) as received,
    ABS(SUM(CASE WHEN m.is_from_me = 1 THEN 1 ELSE 0 END) - SUM(CASE WHEN m.is_from_me = 0 THEN 1 ELSE 0 END)) as imbalance,
    CASE 
        WHEN SUM(CASE WHEN m.is_from_me = 0 THEN 1 ELSE 0 END) = 0 THEN NULL
        ELSE (SUM(CASE WHEN m.is_from_me = 1 THEN 1 ELSE 0 END) * 1.0) / SUM(CASE WHEN m.is_from_me = 0 THEN 1 ELSE 0 END)
    END as ratio
FROM message m
JOIN handle h ON m.handle_id = h.ROWID
GROUP BY h.id
HAVING (SUM(CASE WHEN m.is_from_me = 1 THEN 1 ELSE 0 END) > 50)
ORDER BY imbalance ASC, (sent + received) DESC
LIMIT 1;`)[0] as UnbalancedFriend;
  }

  async runQueries(): Promise<ResultJawn> {
    return {
      textSentSummary: this.textSentSummary()[0],
      topSenders: this.topSenders(),
      topMonths: this.topMonths(),
      topFriends: this.topFriends(),
      unbalancedFriend: this.unbalancedFriend(),
    };
  }
}
