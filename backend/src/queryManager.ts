import { stopWords } from "./consts";
import { InMemoryDB } from "./dbWrapper";

type TextsSentSummary = {
  total_texts_sent: number;
  first_text_date: string;
  last_text_date: string;
};

type TopSender = {
  id: number;
  messages_sent: number;
};

type MostMessagesSentDay = {
  day_of_week:
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  messages_sent: number;
};

type TopFriend = {
  id: number;
  message_count: number;
};

type Message = {
  handle_id: number;
  text: string;
};

type WordCount = {
  word: string;
  count: number;
};

type TopWordsPerFriend = {
  [handle_id: number]: WordCount[];
};

export class QueryManager {
  private db: InMemoryDB;

  constructor(db: InMemoryDB) {
    this.db = db;
  }

  async runQueries(): Promise<{
    resultA: TextsSentSummary[];
    resultB: TopSender[];
    resultC: MostMessagesSentDay[];
    resultD: TopFriend[];
    resultE: TopWordsPerFriend;
  }> {
    const resultA = (await this.db.query(
      `"SELECT 
      COUNT(*) as total_texts_sent,
      MIN(datetime(date / 1000000000 + strftime(""%s"", ""2001-01-01""), ""unixepoch"", ""localtime"")) as first_text_date,
      MAX(datetime(date / 1000000000 + strftime(""%s"", ""2001-01-01""), ""unixepoch"", ""localtime"")) as last_text_date
  FROM message
  WHERE is_from_me = 1;"
      `
    )) as TextsSentSummary[];
    const resultB = (await this.db.query(
      `SELECT 
      h.id, 
      COUNT(*) as messages_sent
  FROM message m
  JOIN handle h ON m.handle_id = h.ROWID
  WHERE m.is_from_me = 1
  GROUP BY h.id
  ORDER BY messages_sent DESC
  LIMIT 10;`
    )) as TopSender[];
    const resultC = (await this.db.query(
      `SELECT 
      CASE strftime('%w', datetime((m.date / 1000000000) + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime'))
          WHEN '0' THEN 'Sunday'
          WHEN '1' THEN 'Monday'
          WHEN '2' THEN 'Tuesday'
          WHEN '3' THEN 'Wednesday'
          WHEN '4' THEN 'Thursday'
          WHEN '5' THEN 'Friday'
          WHEN '6' THEN 'Saturday'
      END as day_of_week,
      COUNT(*) as messages_sent
  FROM message m
  WHERE m.is_from_me = 1
  GROUP BY day_of_week
  ORDER BY messages_sent DESC;`
    )) as MostMessagesSentDay[];
    const resultD = (await this.db.query(`SELECT 
    h.id, 
    COUNT(*) as message_count
FROM message m
JOIN handle h ON m.handle_id = h.ROWID
WHERE 
    strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
GROUP BY h.id
ORDER BY message_count DESC
LIMIT 3;
`)) as TopFriend[];

    const messages = await this.fetchMessagesForTopFriends(resultD);

    // Processing messages for top words
    const resultE = this.processMessages(messages);

    return { resultA, resultB, resultC, resultD, resultE };
  }

  private async fetchMessagesForTopFriends(
    topFriends: TopFriend[]
  ): Promise<Message[]> {
    let messages: Message[] = [];
    for (const friend of topFriends) {
      const friendMessages = (await this.db.query(
        `SELECT handle_id, text FROM message WHERE handle_id = ${friend.id}`
      )) as Message[];
      messages = messages.concat(friendMessages);
    }
    return messages;
  }

  private processMessages(messages: Message[]): TopWordsPerFriend {
    const wordCounts: Record<string, Record<string, number>> = {}; // Change to Record<string, ...>

    for (const message of messages) {
      const words = message.text.toLowerCase().split(/\s+/);
      const handleIdKey = message.handle_id.toString(); // Convert to string

      for (const word of words) {
        if (!stopWords.includes(word) && word.trim() !== "") {
          wordCounts[handleIdKey] = wordCounts[handleIdKey] || {};
          wordCounts[handleIdKey][word] =
            (wordCounts[handleIdKey][word] || 0) + 1;
        }
      }
    }

    const topWordsPerFriend: TopWordsPerFriend = {};
    for (const handleIdKey of Object.keys(wordCounts)) {
      const sortedWords = Object.entries(wordCounts[handleIdKey])
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 words
      topWordsPerFriend[parseInt(handleIdKey)] = sortedWords; // Convert back to number
    }

    return topWordsPerFriend;
  }
}
