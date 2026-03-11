import { Database } from './db';

export interface IQueryable<T> {
  select: (...columns: string[]) => IQueryable<T>;
  where: (column: string, operator: string, value: any) => IQueryable<T>;
  execute: () => Promise<T[]>;
  executeTakeFirst: () => Promise<T | undefined>;
  executeTakeFirstOrThrow: () => Promise<T>;
}

export interface IInsertable<T> {
  values: (value: any) => IReturnable<T>;
}

export interface IReturnable<T> {
  returningAll: () => IExecutable<T>;
}

export interface IExecutable<T> {
  execute: () => Promise<void>;
  executeTakeFirst: () => Promise<T | undefined>;
  executeTakeFirstOrThrow: () => Promise<T>;
}

export interface IUpdateable<T> {
  set: (values: any) => IWhereable<T>;
}

export interface IWhereable<T> {
  where: (column: string, operator: string, value: any) => IExecutable<T>;
}

export interface IDatabaseClient {
  selectFrom<Table extends keyof Database>(
    table: Table
  ): IQueryable<Database[Table]>;

  insertInto<Table extends keyof Database>(
    table: Table
  ): IInsertable<Database[Table]>;

  updateTable<Table extends keyof Database>(
    table: Table
  ): IUpdateable<Database[Table]>;

  destroy(): Promise<void>;
}
