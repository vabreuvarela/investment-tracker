import { IDatabaseClient } from '../database/client/IDatabaseClient';
import { UsersTable } from '../database/client/db';

export interface CreateUserInput {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface User extends UsersTable {}

export class UserRepository {
  constructor(private client: IDatabaseClient) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const query = this.client.selectFrom('users') as any;
    return query.selectAll().where('email', '=', email).executeTakeFirst();
  }

  async findById(id: string): Promise<User | undefined> {
    const query = this.client.selectFrom('users') as any;
    return query.selectAll().where('id', '=', id).executeTakeFirst();
  }

  async create(input: CreateUserInput): Promise<User> {
    const query = this.client.insertInto('users') as any;
    return query.values(input).returningAll().executeTakeFirstOrThrow();
  }

  async update(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User> {
    const query = this.client.updateTable('users') as any;
    return query.set(updates).where('id', '=', id).executeTakeFirstOrThrow();
  }

  async delete(id: string): Promise<void> {
    const query = this.client.updateTable('users') as any;
    await query.set({ deleted_at: new Date() }).where('id', '=', id).execute();
  }
}
