import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { BearNote, BearTag, SearchOptions, convertCoreDataTimestamp } from './types.js';

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
   * Close database connection
   */
  close() {
    this.db.close();
  }
}
