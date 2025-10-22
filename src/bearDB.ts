import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { BearNote, BearTag, SearchOptions, convertCoreDataTimestamp } from './types.js';

// Core Data epoch: January 1, 2001 00:00:00 GMT
const CORE_DATA_EPOCH = new Date('2001-01-01T00:00:00Z').getTime();

export class BearDB {
  private db: Database.Database;
  private dbPath: string;

  constructor(customDbPath?: string) {
    // Default Bear database location
    this.dbPath = customDbPath || join(
      homedir(),
      'Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite'
    );

    if (!existsSync(this.dbPath)) {
      throw new Error(
        chalk.red(`Bear database not found at ${this.dbPath}\n`) +
        chalk.yellow('Please ensure Bear is installed and has been opened at least once.')
      );
    }

    // Open database in read-only mode for safety
    try {
      this.db = new Database(this.dbPath, { readonly: true });
      console.error(chalk.green('✓ Connected to Bear database (read-only)'));
    } catch (error) {
      throw new Error(
        chalk.red(`Failed to open Bear database: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  /**
   * Parse tags from Bear's tag format
   */
  private parseTags(tagString: string | null): string[] {
    if (!tagString) return [];
    
    // Bear stores tags in a specific format, parse them
    const tags: string[] = [];
    const tagRegex = /#([^#\s]+)/g;
    let match;
    
    while ((match = tagRegex.exec(tagString)) !== null) {
      tags.push(match[1]);
    }
    
    return tags;
  }

  /**
   * Convert a database row to BearNote object
   */
  private rowToNote(row: any): BearNote {
    return {
      id: row.ZUNIQUEIDENTIFIER,
      title: row.ZTITLE || 'Untitled',
      content: row.ZTEXT || '',
      creationDate: convertCoreDataTimestamp(row.ZCREATIONDATE),
      modificationDate: convertCoreDataTimestamp(row.ZMODIFICATIONDATE),
      tags: this.parseTags(row.ZTEXT),
      isPinned: Boolean(row.ZPINNED),
      isTrashed: Boolean(row.ZTRASHED)
    };
  }

  /**
   * Get a note by title or ID
   */
  getNoteByTitleOrId(query: string): BearNote | null {
    const stmt = this.db.prepare(`
      SELECT * FROM ZSFNOTE 
      WHERE (ZTITLE = ? OR ZUNIQUEIDENTIFIER = ?)
      AND ZTRASHED = 0
      LIMIT 1
    `);

    const row = stmt.get(query, query);
    return row ? this.rowToNote(row) : null;
  }

  /**
   * Search notes by term and/or tag
   */
  searchNotes(options: SearchOptions): BearNote[] {
    let query = 'SELECT * FROM ZSFNOTE WHERE ZTRASHED = 0';
    const params: any[] = [];

    if (options.term) {
      query += ' AND (ZTITLE LIKE ? OR ZTEXT LIKE ?)';
      const searchTerm = `%${options.term}%`;
      params.push(searchTerm, searchTerm);
    }

    if (options.tag) {
      query += ' AND ZTEXT LIKE ?';
      params.push(`%#${options.tag}%`);
    }

    query += ' ORDER BY ZMODIFICATIONDATE DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => this.rowToNote(row));
  }

  /**
   * Get all unique tags
   */
  getAllTags(): BearTag[] {
    // Query all non-trashed notes
    const stmt = this.db.prepare(`
      SELECT ZTEXT FROM ZSFNOTE 
      WHERE ZTRASHED = 0 AND ZTEXT IS NOT NULL
    `);
    
    const rows = stmt.all() as Array<{ ZTEXT: string }>;
    const tagCounts = new Map<string, number>();

    // Extract tags from each note
    for (const row of rows) {
      const tags = this.parseTags(row.ZTEXT);
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    // Convert to BearTag array
    return Array.from(tagCounts.entries())
      .map(([name, noteCount]) => ({ name, noteCount }))
      .sort((a, b) => b.noteCount - a.noteCount);
  }

  /**
   * Get all notes with a specific tag
   */
  getNotesByTag(tag: string): BearNote[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ZSFNOTE 
      WHERE ZTRASHED = 0 
      AND ZTEXT LIKE ?
      ORDER BY ZMODIFICATIONDATE DESC
    `);

    const rows = stmt.all(`%#${tag}%`);
    return rows.map(row => this.rowToNote(row));
  }

  /**

  /**
   * Get recently modified notes
   */
  getRecentNotes(options: { limit: number; includePinned: boolean }): BearNote[] {
    let query = 'SELECT * FROM ZSFNOTE WHERE ZTRASHED = 0';
    const params: any[] = [];
    
    if (!options.includePinned) {
      query += ' AND ZPINNED = 0';
    }
    
    query += ' ORDER BY ZMODIFICATIONDATE DESC LIMIT ?';
    params.push(options.limit);
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => this.rowToNote(row));
  }

  /**
   * Get all pinned notes
   */
  getPinnedNotes(sortBy: 'modified' | 'created' = 'modified'): BearNote[] {
    const orderField = sortBy === 'created' ? 'ZCREATIONDATE' : 'ZMODIFICATIONDATE';
    const stmt = this.db.prepare(`
      SELECT * FROM ZSFNOTE 
      WHERE ZTRASHED = 0 AND ZPINNED = 1
      ORDER BY ${orderField} DESC
    `);
    
    const rows = stmt.all();
    return rows.map(row => this.rowToNote(row));
  }

  /**
   * Get notes by date range
   */
  getNotesByDateRange(startDate: Date, endDate: Date, dateType: 'created' | 'modified', limit: number): BearNote[] {
    const dateField = dateType === 'created' ? 'ZCREATIONDATE' : 'ZMODIFICATIONDATE';
    
    // Convert JavaScript dates to Core Data timestamps
    const startTimestamp = (startDate.getTime() - CORE_DATA_EPOCH) / 1000;
    const endTimestamp = (endDate.getTime() - CORE_DATA_EPOCH) / 1000;
    
    const stmt = this.db.prepare(`
      SELECT * FROM ZSFNOTE 
      WHERE ZTRASHED = 0 
      AND ${dateField} >= ? 
      AND ${dateField} <= ?
      ORDER BY ${dateField} DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(startTimestamp, endTimestamp, limit);
    return rows.map(row => this.rowToNote(row));
  }

  /**
   * Get statistics about the notes database
   */
  getNoteStatistics(): any {
    // Total notes
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0');
    const totalNotes = (totalStmt.get() as any).count;
    
    // Pinned notes
    const pinnedStmt = this.db.prepare('SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0 AND ZPINNED = 1');
    const pinnedNotes = (pinnedStmt.get() as any).count;
    
    // Notes with tags
    const taggedStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0 AND ZTEXT LIKE '%#%'`);
    const notesWithTags = (taggedStmt.get() as any).count;
    
    // Get all tags
    const allTags = this.getAllTags();
    const uniqueTags = allTags.length;
    const topTags = allTags.slice(0, 10);
    
    // Average note length
    const lengthStmt = this.db.prepare('SELECT AVG(LENGTH(ZTEXT)) as avg FROM ZSFNOTE WHERE ZTRASHED = 0');
    const averageNoteLength = (lengthStmt.get() as any).avg || 0;
    
    // Notes created/modified this week and month
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weekTimestamp = (weekAgo.getTime() - CORE_DATA_EPOCH) / 1000;
    const monthTimestamp = (monthAgo.getTime() - CORE_DATA_EPOCH) / 1000;
    
    const createdWeekStmt = this.db.prepare('SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0 AND ZCREATIONDATE >= ?');
    const notesCreatedThisWeek = (createdWeekStmt.get(weekTimestamp) as any).count;
    
    const modifiedWeekStmt = this.db.prepare('SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0 AND ZMODIFICATIONDATE >= ?');
    const notesModifiedThisWeek = (modifiedWeekStmt.get(weekTimestamp) as any).count;
    
    const createdMonthStmt = this.db.prepare('SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0 AND ZCREATIONDATE >= ?');
    const notesCreatedThisMonth = (createdMonthStmt.get(monthTimestamp) as any).count;
    
    const modifiedMonthStmt = this.db.prepare('SELECT COUNT(*) as count FROM ZSFNOTE WHERE ZTRASHED = 0 AND ZMODIFICATIONDATE >= ?');
    const notesModifiedThisMonth = (modifiedMonthStmt.get(monthTimestamp) as any).count;
    
    // Note length distribution
    const lengthDistStmt = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN LENGTH(ZTEXT) < 100 THEN 1 ELSE 0 END) as veryShort,
        SUM(CASE WHEN LENGTH(ZTEXT) >= 100 AND LENGTH(ZTEXT) < 500 THEN 1 ELSE 0 END) as short,
        SUM(CASE WHEN LENGTH(ZTEXT) >= 500 AND LENGTH(ZTEXT) < 2000 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN LENGTH(ZTEXT) >= 2000 AND LENGTH(ZTEXT) < 5000 THEN 1 ELSE 0 END) as long,
        SUM(CASE WHEN LENGTH(ZTEXT) >= 5000 THEN 1 ELSE 0 END) as veryLong
      FROM ZSFNOTE WHERE ZTRASHED = 0
    `);
    const lengthDist = lengthDistStmt.get() as any;
    
    return {
      totalNotes,
      pinnedNotes,
      notesWithTags,
      uniqueTags,
      topTags,
      averageNoteLength,
      notesCreatedThisWeek,
      notesModifiedThisWeek,
      notesCreatedThisMonth,
      notesModifiedThisMonth,
      noteLengthDistribution: {
        veryShort: lengthDist.veryShort || 0,
        short: lengthDist.short || 0,
        medium: lengthDist.medium || 0,
        long: lengthDist.long || 0,
        veryLong: lengthDist.veryLong || 0
      }
    };
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}
