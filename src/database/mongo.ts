import { MongoClient, Db } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const DB_NAME = process.env.MONGO_DB || 'investment_tracker';

let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGO_URL);
    await client.connect();
  }
  return client;
}

export async function getDb(): Promise<Db> {
  const c = await getMongoClient();
  return c.db(DB_NAME);
}
