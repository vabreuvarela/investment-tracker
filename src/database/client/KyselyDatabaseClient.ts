import { Pool } from 'pg';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Database } from './db';
import {
  IDatabaseClient,
  IQueryable,
  IInsertable,
  IReturnable,
  IExecutable,
  IUpdateable,
  IWhereable,
} from './IDatabaseClient';

class KyselyQueryable<T> implements IQueryable<T> {
  constructor(private query: any) {}

  select(...columns: string[]): IQueryable<T> {
    this.query = this.query.select(columns);
    return this;
  }

  where(column: string, operator: string, value: any): IQueryable<T> {
    this.query = this.query.where(column, operator, value);
    return this;
  }

  selectAll(): IQueryable<T> {
    this.query = this.query.selectAll();
    return this;
  }

  async execute(): Promise<T[]> {
    return this.query.execute();
  }

  async executeTakeFirst(): Promise<T | undefined> {
    return this.query.executeTakeFirst();
  }

  async executeTakeFirstOrThrow(): Promise<T> {
    return this.query.executeTakeFirstOrThrow();
  }
}

class KyselyInsertable<T> implements IInsertable<T> {
  constructor(private insert: any) {}

  values(value: any): IReturnable<T> {
    return new KyselyReturnable<T>(this.insert.values(value));
  }
}

class KyselyReturnable<T> implements IReturnable<T> {
  constructor(private query: any) {}

  returningAll(): IExecutable<T> {
    return new KyselyExecutable<T>(this.query.returningAll());
  }
}

class KyselyExecutable<T> implements IExecutable<T> {
  constructor(private query: any) {}

  async execute(): Promise<void> {
    await this.query.execute();
  }

  async executeTakeFirst(): Promise<T | undefined> {
    return this.query.executeTakeFirst();
  }

  async executeTakeFirstOrThrow(): Promise<T> {
    return this.query.executeTakeFirstOrThrow();
  }
}

class KyselyUpdateable<T> implements IUpdateable<T> {
  constructor(private update: any) {}

  set(values: any): IWhereable<T> {
    return new KyselyWhereable<T>(this.update.set(values));
  }
}

class KyselyWhereable<T> implements IWhereable<T> {
  constructor(private query: any) {}

  where(column: string, operator: string, value: any): IExecutable<T> {
    return new KyselyExecutable<T>(this.query.where(column, operator, value));
  }
}

export class KyselyDatabaseClient implements IDatabaseClient {
  private db: Kysely<Database>;

  constructor() {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString:
          process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/investment_tracker',
      }),
    });

    this.db = new Kysely<Database>({
      dialect,
    });
  }

  selectFrom<Table extends keyof Database>(table: Table): IQueryable<Database[Table]> {
    return new KyselyQueryable<Database[Table]>(this.db.selectFrom(table as any));
  }

  insertInto<Table extends keyof Database>(table: Table): IInsertable<Database[Table]> {
    return new KyselyInsertable<Database[Table]>(this.db.insertInto(table as any));
  }

  updateTable<Table extends keyof Database>(table: Table): IUpdateable<Database[Table]> {
    return new KyselyUpdateable<Database[Table]>(this.db.updateTable(table as any));
  }

  async destroy(): Promise<void> {
    await this.db.destroy();
  }
}
