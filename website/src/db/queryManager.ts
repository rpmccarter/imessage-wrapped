import { stopWords } from './consts';
import { InMemoryDB } from './InMemoryDB';
import * as emoji from 'emoji-regex';
import sw from 'stopword';

export type TextsSentSummary = {
  total_texts_sent: number;
  first_text_date: string;
  last_text_date: string;
};

export type TopSender = {
  id: string;
  messages_sent: number;
};

export type MessagesPerDay = Record<DayOfWeek, number>;

export type MonthOfYear =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export type TopMonths = Record<MonthOfYear, number>;

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

export type UnbalancedFriend = {
  id: string;
  sent: number;
  received: number;
  ratio: number;
};

export type ResultJawn = {
  textSentSummary: TextsSentSummary;
  topSenders: TopSender[];
  topMonths: TopMonths;
  topFriends: TopFriends;
  unbalancedFriend: UnbalancedFriend;
};

export class QueryManager {
  map: Record<string, string> = {};

  constructor(private db: InMemoryDB) {}

  static async runQueries(chatFile: File, contactFile?: File) {
    const db = await InMemoryDB.create(chatFile);
    const queryManager = new QueryManager(db);
    return queryManager.runQueries();
  }

  async runQueries(): Promise<ResultJawn> {
    const textSentSummary = (await this.db.query(
      `SELECT 
        COUNT(*) as total_texts_sent,
        MIN(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as first_text_date,
        MAX(datetime(date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) as last_text_date
      FROM message m
      WHERE is_from_me = 1
      AND strftime('%Y', datetime(m.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime')) = '2023'`,
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
  LIMIT 10;`,
    )) as TopSender[];

    const messagesPerMonthResult = (await this.db.query(
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
    )) as { month_of_year: MonthOfYear; messages_sent: number }[];

    const topMonths: TopMonths = messagesPerMonthResult.reduce(
      (acc, current) => {
        acc[current.month_of_year] = current.messages_sent;
        return acc;
      },
      {} as TopMonths,
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
      {} as Record<string, TopFriend>,
    );

    const unbalancedFriend = (await this.db.query(`SELECT 
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
LIMIT 1;`)) as UnbalancedFriend[];

    const randomNamesMap = this.createIdToNameMap([
      ...topSenders.map((sender) => sender.id),
      ...topFriendsRaw.map((friend) => friend.id),
      unbalancedFriend[0].id,
    ]);

    const topSenderz: TopSender[] = topSenders.map((sender) => {
      return {
        ...sender,
        id: sender.id,
      };
    });

    const topFriendz: TopFriends = {};
    topFriendsRaw.forEach((friend) => {
      const friendId = friend.id;
      const friendName = randomNamesMap[friendId] || friendId;

      topFriendz[friendId] = {
        id: friendId,
        message_count: friend.message_count,
        top_word_count:
          topWordsPerFriend.find((f) => f.id === friendId)?.wordCount || [],
        top_emojis: topEmojisPerFriend[friendId] || [],
      };
    });

    unbalancedFriend[0].id =
      randomNamesMap[unbalancedFriend[0].id] ?? unbalancedFriend[0].id;
    return {
      textSentSummary: textSentSummary[0],
      topSenders: topSenderz,
      topMonths,
      topFriends: topFriendz,
      unbalancedFriend: unbalancedFriend[0],
    };
  }

  private async fetchMessagesForTopFriends(
    topFriends: TopFriend[],
  ): Promise<Message[]> {
    let messages: Message[] = [];
    for (const friend of topFriends) {
      const friendMessages = (await this.db.query(`
            SELECT h.id as handle_id, m.text 
            FROM message m
            JOIN handle h ON m.handle_id = h.ROWID
            WHERE h.id = '${friend.id}'
            AND text NOTNULL;
        `)) as Message[];

      messages = messages.concat(friendMessages);
    }
    return messages.filter(
      (messages) => messages.text != null && messages.text != '',
    );
  }

  private processMessages(messages: Message[]): TopWordsPerFriend[] {
    const wordCounts: Record<string, Record<string, number>> = {};

    messages.forEach((message, index) => {
      if (message.text) {
        const words = sw.removeStopwords(
          message.text.toLowerCase().split(/\s+/),
          stopWords,
        );
        const handleIdKey = message.handle_id;

        words.forEach((word: any) => {
          if (word.trim() !== '') {
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

  generateRandomName() {
    const names = [
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eva',
      'Fiona',
      'George',
      'Hannah',
      'Ian',
      'Julia',
      'Kyle',
      'Laura',
      'Mike',
      'Nina',
      'Oscar',
      'Paula',
      'Quincy',
      'Rachel',
      'Steve',
      'Tina',
      'Uma',
      'Victor',
      'Wendy',
      'Xander',
      'Yvonne',
      'Zach',
      'Amelia',
      'Brad',
      'Catherine',
      'Derek',
      'Elaine',
      'Frank',
      'Grace',
      'Henry',
      'Isabella',
      'Jack',
      'Katie',
      'Liam',
      'Megan',
      'Nathan',
      'Olivia',
      'Peter',
      'Quinn',
      'Ruby',
      'Samuel',
      'Tracy',
      'Ulysses',
      'Vanessa',
      'William',
      'Xenia',
      'Yara',
      'Zane',
      'Ava',
      'Benjamin',
      'Chloe',
      'Dylan',
      'Emma',
      'Freddie',
      'Gina',
      'Harvey',
      'Ivy',
      'Jason',
      'Kelsey',
      'Leon',
      'Mia',
      'Noah',
      'Ophelia',
      'Patrick',
      'Queen',
      'Ronald',
      'Sylvia',
      'Timothy',
      'Ursula',
      'Violet',
      'Winston',
      'Xavier',
      'Yasmine',
      'Zeke',
      'Anastasia',
      'Boris',
      'Carmen',
      'Dominic',
      'Eleanor',
      'Felix',
      'Gemma',
      'Howard',
      'Iris',
      'Jerome',
      'Kristina',
      'Lucas',
      'Monica',
      'Nigel',
      'Octavia',
      'Penelope',
      'Quentin',
      'Rosalind',
      'Sebastian',
      'Tabitha',
      'Uriel',
      'Veronica',
      'Wayne',
      'Ximena',
      'Yolanda',
      'Zephyr',
    ];

    return names[Math.floor(Math.random() * names.length)];
  }

  // Function to create a mapping from id to random name
  createIdToNameMap(ids: any) {
    ids.forEach((id: any) => {
      this.map[id] = this.generateRandomName();
    });
    return this.map;
  }

  getTopEmojisPerFriend(messages: Message[]): Record<string, Emoji[]> {
    const emojiCountsPerFriend: Record<string, Record<string, number>> = {};
    const regex = emoji.default();

    for (const message of messages) {
      const text = message.text || '';
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
          emojiCountsPerFriend[friendId],
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) // Take the top 5 emojis
          .map(([emoji, count]) => ({ emoji, count }));
      }
    }

    return topEmojisPerFriend;
  }
}