import { v7 as uuidv7 } from 'uuid';

/**
 * Generates a UUIDv7 (time-based UUID)
 * UUIDv7 includes timestamp information, allowing them to be ordered by creation date
 * @returns A UUIDv7 string
 */
export function generateUUIDv7(): string {
  return uuidv7();
}
