// Type definitions for Bear MCP Server

export interface BearNote {
  id: string;
  title: string;
  content: string;
  creationDate: Date;
  modificationDate: Date;
  tags: string[];
  isPinned: boolean;
  isTrashed: boolean;
}

export interface BearTag {
  name: string;
  noteCount: number;
}

export interface SearchOptions {
  term?: string;
  tag?: string;
  limit?: number;
}

export interface BearConfig {
  dbPath?: string;
}

// Core Data timestamp conversion
// Bear uses Core Data timestamps (seconds since 2001-01-01)
export const CORE_DATA_EPOCH = new Date('2001-01-01T00:00:00Z').getTime();

export function convertCoreDataTimestamp(timestamp: number): Date {
  return new Date(CORE_DATA_EPOCH + timestamp * 1000);
}

export function formatDate(date: Date): string {
  return date.toISOString();
}
