import { getDb } from '../database/mongo';

export interface Investment {
  created_at: Date;
  user_uuid: string;
  amount_cents: number;
  investment_uuid: string;
}

export class InvestmentRepository {
  async findByUserId(userId: string): Promise<Investment[]> {
    const db = await getDb();
    const collection = db.collection<Investment>('investments');
    const docs = await collection.find({ user_uuid: userId }).toArray();
    // Ensure created_at is a Date object
    return docs.map(d => ({
      ...d,
      created_at: d.created_at ? new Date(d.created_at) : new Date(0),
    }));
  }
}
