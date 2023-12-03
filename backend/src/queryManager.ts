import { stopWords } from "./consts";
import { InMemoryDB } from "./dbWrapper";

type TextsSentSummary = {
  total_texts_sent: number;
  first_text_date: string;
  last_text_date: string;
};

type TopSender = {
  id: string;
  messages_sent: number;
};

type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type MessagesPerDay = Record<DayOfWeek, number>;

type TopFriend = {
  id: string;
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
  id: string;
  wordCount: WordCount[];
};

export class QueryManager {
  private db: InMemoryDB;

  constructor(db: InMemoryDB) {
    this.db = db;
  }

  async runQueries(): Promise<{
    textSentSummary: TextsSentSummary[];
    topSenders: TopSender[];
    messagesPerDay: MessagesPerDay;
    topFriends: TopFriend[];
    topWordsPerFriend: TopWordsPerFriend[];
  }> {
    const textSentSummary = (await this.db.query(
      `SELECT 
        COUNT(*) as total_texts_sent,
        MIN(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as first_text_date,
        MAX(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as last_text_date
      FROM message
      WHERE is_from_me = 1`
    )) as TextsSentSummary[];

    const topSenders = (await this.db.query(
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
    const messagesPerDayResult = (await this.db.query(
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
    )) as { day_of_week: DayOfWeek; messages_sent: number }[];

    const messagesPerDay: MessagesPerDay = messagesPerDayResult.reduce(
      (acc, current) => {
        acc[current.day_of_week] = current.messages_sent;
        return acc;
      },
      {} as MessagesPerDay
    );

    const topFriends = (await this.db.query(`SELECT 
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

    const messages = await this.fetchMessagesForTopFriends(topFriends);

    const topWordsPerFriend = this.processMessages(messages);

    return {
      textSentSummary,
      topSenders,
      messagesPerDay,
      topFriends,
      topWordsPerFriend,
    };
  }

  private async fetchMessagesForTopFriends(
    topFriends: TopFriend[]
  ): Promise<Message[]> {
    let messages: Message[] = [];
    for (const friend of topFriends) {
      const friendMessages = (await this.db.query(`
            SELECT m.handle_id, m.text 
            FROM message m
            JOIN handle h ON m.handle_id = h.ROWID
            WHERE h.id = '${friend.id}'
            AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
        `)) as Message[];
      messages = messages.concat(friendMessages);
    }
    return messages;
  }

  private processMessages(messages: Message[]): TopWordsPerFriend[] {
    const wordCounts: Record<string, Record<string, number>> = {};

    messages.forEach((message, index) => {
      // Check if message.text is not null or empty
      if (message.text) {
        const words = message.text.toLowerCase().split(/\s+/);
        const handleIdKey = message.handle_id.toString();

        words.forEach((word) => {
          if (!stopWords.includes(word) && word.trim() !== "") {
            wordCounts[handleIdKey] = wordCounts[handleIdKey] || {};
            wordCounts[handleIdKey][word] =
              (wordCounts[handleIdKey][word] || 0) + 1;
          }
        });
      }
    });

    const topWordsPerFriend: TopWordsPerFriend[] = [];
    for (const handleIdKey of Object.keys(wordCounts)) {
      const sortedWords = Object.entries(wordCounts[handleIdKey])
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 words

      topWordsPerFriend.push({ id: handleIdKey, wordCount: sortedWords });
    }

    return topWordsPerFriend;
  }
}
