import { stopWords } from "./consts";
import { InMemoryDB } from "./dbWrapper";
import * as emoji from "emoji-regex";
import * as sw from "stopword";

export type TextsSentSummary = {
  total_texts_sent: number;
  first_text_date: string;
  last_text_date: string;
};

export type TopSender = {
  id: string;
  messages_sent: number;
};

export type DayOfWeek =
  | "Monday"
  | "Sunday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type MessagesPerDay = Record<DayOfWeek, number>;

export type TopFriends = Record<string, TopFriend>;

export type TopFriend = {
  id: string;
  message_count: number;
  top_word_count: WordCount[];
  top_emojis: Emoji[];
};

export type TopWordsPerFriend = {
  id: string;
  wordCount: WordCount[];
};

export type Message = {
  handle_id: number;
  text: string;
};

export type Emoji = {
  emoji: string;
  count: number;
};

export type WordCount = {
  word: string;
  count: number;
};

export type ResultJawn = {
  textSentSummary: TextsSentSummary;
  topSenders: TopSender[];
  messagesPerDay: MessagesPerDay;
  topFriends: TopFriends;
};

export class QueryManager {
  private db: InMemoryDB;

  constructor(db: InMemoryDB) {
    this.db = db;
  }

  async runQueries(): Promise<ResultJawn> {
    const textSentSummary = (await this.db.query(
      `SELECT 
        COUNT(*) as total_texts_sent,
        MIN(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as first_text_date,
        MAX(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as last_text_date
      FROM message m
      WHERE is_from_me = 1
      AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'`
    )) as TextsSentSummary[];

    const topSenders = (await this.db.query(
      `SELECT 
      h.id, 
      COUNT(*) as messages_sent
  FROM message m
  JOIN handle h ON m.handle_id = h.ROWID
  WHERE m.is_from_me = 1
  AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
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
        AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'
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

    const topFriendsRaw = (await this.db.query(`SELECT 
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
`)) as TopFriend[];

    const messages = await this.fetchMessagesForTopFriends(topFriendsRaw);
    const topWordsPerFriend = this.processMessages(messages);
    const topEmojisPerFriend = this.getTopEmojisPerFriend(messages);

    const topFriends: TopFriends = topFriendsRaw.reduce(
      (acc: Record<string, TopFriend>, topFriend) => {
        acc[topFriend.id] = {
          ...topFriend,
          top_word_count:
            topWordsPerFriend.find((f) => f.id === topFriend.id)?.wordCount ||
            [],
          top_emojis: topEmojisPerFriend[topFriend.id] || [],
        };
        return acc;
      },
      {} as Record<string, TopFriend>
    );

    return {
      textSentSummary: textSentSummary[0],
      topSenders,
      messagesPerDay,
      topFriends,
    };
  }

  private async fetchMessagesForTopFriends(
    topFriends: TopFriend[]
  ): Promise<Message[]> {
    let messages: Message[] = [];
    for (const friend of topFriends) {
      const friendMessages = (await this.db.query(`
            SELECT h.id as handle_id, m.text 
            FROM message m
            JOIN handle h ON m.handle_id = h.ROWID
            WHERE h.id = '${friend.id}'
        `)) as Message[];

      messages = messages.concat(friendMessages);
    }
    return messages.filter(
      (messages) => messages.text != null && messages.text != ""
    );
  }

  private processMessages(messages: Message[]): TopWordsPerFriend[] {
    const wordCounts: Record<string, Record<string, number>> = {};

    messages.forEach((message, index) => {
      if (message.text) {
        const words = sw.removeStopwords(
          message.text.toLowerCase().split(/\s+/),
          stopWords
        );
        const handleIdKey = message.handle_id;

        words.forEach((word: any) => {
          if (word.trim() !== "") {
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
        .slice(0, 5);

      topWordsPerFriend.push({ id: handleIdKey, wordCount: sortedWords });
    }

    return topWordsPerFriend;
  }

  getTopEmojisPerFriend(messages: Message[]): Record<string, Emoji[]> {
    const emojiCountsPerFriend: Record<string, Record<string, number>> = {};
    const regex = emoji.default();

    for (const message of messages) {
      const text = message.text || "";
      for (const match of text.matchAll(regex)) {
        const emoji = match[0];
        const friendId = message.handle_id.toString();

        if (!emojiCountsPerFriend[friendId]) {
          emojiCountsPerFriend[friendId] = {};
        }

        emojiCountsPerFriend[friendId][emoji] =
          (emojiCountsPerFriend[friendId][emoji] || 0) + 1;
      }
    }

    const topEmojisPerFriend: Record<string, Emoji[]> = {};
    for (const friendId in emojiCountsPerFriend) {
      if (emojiCountsPerFriend.hasOwnProperty(friendId)) {
        topEmojisPerFriend[friendId] = Object.entries(
          emojiCountsPerFriend[friendId]
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) // Take the top 5 emojis
          .map(([emoji, count]) => ({ emoji, count }));
      }
    }

    return topEmojisPerFriend;
  }
}
