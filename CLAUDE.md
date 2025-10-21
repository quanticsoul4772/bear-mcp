# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides read-only access to Bear notes via SQLite database queries. The server allows AI assistants to search and read Bear notes through MCP tools.

## Development Commands

### Build and Run
```bash
npm run build          # Compile TypeScript to dist/
npm run watch          # Watch mode for development
npm run dev            # Build and start server
npm start              # Run compiled server from dist/
```

### Testing the Server
The server uses stdio transport and is designed to be integrated with MCP clients like Claude Desktop. To test manually:
```bash
npm run dev
```

The server will connect via stdio and log available tools to stderr.

## Architecture

### Core Components

**src/index.ts** - Main server entry point
- Initializes `BearMCPServer` class with MCP SDK
- Sets up stdio transport for communication
- Registers tool handlers via `ListToolsRequestSchema` and `CallToolRequestSchema`
- Handles graceful shutdown (SIGINT/SIGTERM) to close database connection
- Accepts `--db-path` CLI argument for custom database locations

**src/bearDB.ts** - Database abstraction layer
- `BearDB` class wraps better-sqlite3 with read-only access
- Default database path: `~/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite`
- All queries filter out trashed notes (`ZTRASHED = 0`)
- Key methods:
  - `getNoteByTitleOrId()` - Find note by exact title or UUID
  - `searchNotes()` - Full-text search with optional tag filtering
  - `getAllTags()` - Extract all tags from note content and count usage
  - `getNotesByTag()` - Get all notes containing specific tag
- Private helper `rowToNote()` converts database rows to BearNote objects
- Private helper `parseTags()` extracts hashtags from note content using regex

**src/types.ts** - TypeScript type definitions
- `BearNote` - Core note interface with id, title, content, dates, tags, flags
- `BearTag` - Tag with name and usage count
- `SearchOptions` - Search parameters (term, tag, limit)
- `convertCoreDataTimestamp()` - Converts Bear's Core Data timestamps (seconds since 2001-01-01) to JavaScript Date objects

**src/tools/** - MCP tool implementations
- Each tool exports a `Tool` schema definition and async handler function
- `openNote.ts` - Opens note by title or ID, returns full content with metadata
- `searchNotes.ts` - Searches by term and/or tag, returns previews (150 chars) with metadata
- `getTags.ts` - Lists all tags sorted by frequency
- `openTag.ts` - Lists all notes with a specific tag
- `index.ts` - Exports unified tool array and handlers

### Bear Database Schema

The server queries the `ZSFNOTE` table with these columns:
- `ZUNIQUEIDENTIFIER` - Note UUID
- `ZTITLE` - Note title
- `ZTEXT` - Full note content (includes tags as #hashtags)
- `ZCREATIONDATE` - Core Data timestamp
- `ZMODIFICATIONDATE` - Core Data timestamp
- `ZPINNED` - Boolean flag
- `ZTRASHED` - Boolean flag (always filtered to 0)

Tags are not stored in a separate table; they're extracted from note content using regex pattern `/#([^#\s]+)/g`.

### Module System

The project uses ES modules (`"type": "module"` in package.json):
- All imports must include `.js` extensions (even for `.ts` source files)
- TypeScript compiles to ES2022 with ESNext modules
- Uses `import` syntax exclusively, no `require()`

## Important Implementation Details

### Read-Only Safety
The database is opened with `{ readonly: true }` flag to prevent any accidental modifications. All operations are SELECT queries only.

### Error Handling
- Database connection errors exit process with code 1
- Tool execution errors are caught and returned as error messages in MCP response format
- Missing notes return descriptive "not found" messages rather than errors

### Tag Parsing
Tags are embedded in note content as `#tagname`. The server:
1. Extracts tags using regex from `ZTEXT` column
2. Supports nested tags like `#work/project`
3. Tag searches use SQL LIKE pattern `%#tagname%`

### Timestamp Conversion
Bear uses Core Data timestamps (seconds since 2001-01-01 00:00:00 UTC). The `convertCoreDataTimestamp()` function adds this epoch offset and converts to JavaScript Date objects.

### CLI Arguments
The server accepts command-line arguments via yargs:
- `--db-path` / `-d` - Custom database path (overrides default Bear location)

### Output Channels
- MCP protocol communication via stdio (stdout/stdin)
- Logging and status messages via stderr (using chalk for colors)
- Prevents logs from interfering with MCP JSON-RPC messages

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `better-sqlite3` - Native SQLite bindings for database access
- `chalk` - Terminal coloring for stderr logs
- `yargs` - CLI argument parsing
