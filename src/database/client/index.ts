import { IDatabaseClient } from './IDatabaseClient';
import { KyselyDatabaseClient } from './KyselyDatabaseClient';

let clientInstance: IDatabaseClient | null = null;

export function createDatabaseClient(): IDatabaseClient {
  if (!clientInstance) {
    clientInstance = new KyselyDatabaseClient();
  }
  return clientInstance;
}

export function resetDatabaseClient(): void {
  clientInstance = null;
}
