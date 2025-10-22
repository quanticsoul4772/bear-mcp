# Bear MCP Server

A Model Context Protocol (MCP) server that provides access to your Bear notes. This server allows AI assistants like Claude to search and read your Bear notes.

## Features

### Read Operations
- Search notes by title, content, or tags
- Open specific notes by title or ID
- Browse all tags with note counts
- View notes by tag to explore related content
- Direct SQLite queries for fast results

### Write Operations
- Create new notes with tags and pin option
- Add text to existing notes (append, prepend, or replace)
- Move notes to trash
- Rename tags across all notes
- Delete tags from all notes

## Installation

### Option 1: Install from npm (when published)
```bash
npm install -g @mcp/bear-server
```

### Option 2: Install from source
```bash
# Clone the repository
git clone https://github.com/quanticsoul4772/bear-mcp
cd bear-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm link
```

## Configuration

### For Claude Desktop

Add this to your configuration file at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bear-mcp": {
      "command": "node",
      "args": [
        "--max-old-space-size=4096",
        "--expose-gc", 
        "--max-semi-space-size=64",
        "/Users/yourusername/Projects/mcp-servers/bear-mcp/dist/index.js"
      ],
      "type": "stdio"
    }
  }
}
```

### Custom Database Path

If your Bear database is in a non-standard location, you can specify it:

```json
{
  "mcpServers": {
    "bear-mcp": {
      "command": "node",
      "args": [
        "--max-old-space-size=4096",
        "--expose-gc",
        "--max-semi-space-size=64",
        "/path/to/bear-mcp/dist/index.js",
        "--db-path",
        "/custom/path/to/database.sqlite"
      ],
      "type": "stdio"
    }
  }
}
```

## Available Tools

### `open_note`
Open a specific note by its title or unique ID.

Example usage:
- "Open my note titled 'Project Ideas'"
- "Show me the note with ID 123ABC-456DEF"

### `search_notes`
Search for notes containing specific terms or tags.

Example usage:
- "Search for notes about machine learning"
- "Find all notes tagged with #work"
- "Search for 'API' in notes with tag #documentation"

### `get_tags`
List all tags in your Bear notes, organized by frequency.

Example usage:
- "What tags do I use in Bear?"
- "Show me all my Bear tags"

### `open_tag`
Display all notes that have a specific tag.

Example usage:
- "Show me all notes tagged #recipes"
- "List notes with the #meeting tag"

### `create_note`
Create a new note in Bear.

Example usage:
- "Create a note titled 'Meeting Notes' with content 'Discussed project timeline'"
- "Create a note with tags 'work, project' and pin it"

### `add_text`
Add text to an existing note (append, prepend, or replace).

Example usage:
- "Append 'Follow-up tasks' to the note with ID 123ABC"
- "Prepend today's date to my meeting notes"
- "Replace the content of note 456DEF with new text"

### `trash_note`
Move a note to trash.

Example usage:
- "Trash the note with ID 789GHI"
- "Delete my note titled 'Old Draft'"

### `rename_tag`
Rename a tag across all notes.

Example usage:
- "Rename tag 'todo' to 'tasks'"
- "Change the #work tag to #office"

### `delete_tag`
Delete a tag from all notes.

Example usage:
- "Delete the tag 'temporary'"
- "Remove the #old-project tag from all notes"

## Development

### Prerequisites
- Node.js 18 or higher
- Bear app installed on macOS
- TypeScript knowledge for contributions

### Building from source
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Watch for changes
npm run watch
```

### Project Structure
```
bear-mcp/
├── src/
│   ├── index.ts        # Main server entry point
│   ├── bearDB.ts       # Database connection and queries
│   ├── types.ts        # TypeScript type definitions
│   └── tools/          # Tool implementations
│       ├── index.ts
│       ├── openNote.ts
│       ├── searchNotes.ts
│       ├── getTags.ts
│       └── openTag.ts
├── dist/               # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Security

This server implements several security measures:

1. Local access only - Runs via stdio, not network accessible
2. Filtered results - Trashed notes are automatically excluded

## Troubleshooting

### "Bear database not found"
- Ensure Bear is installed and has been opened at least once
- Check if the database exists at `~/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite`
- Use the `--db-path` option if your database is elsewhere

### "Permission denied"
- The server needs read access to the Bear database
- Check file permissions on the database file

### No results returned
- Verify that you have notes in Bear
- Check that notes aren't in the trash
- Ensure search terms are spelled correctly

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by the [Bear app](https://bear.app) team
- Thanks to the MCP community for the protocol and SDKs
- Based on patterns from other MCP server implementations

## Disclaimer

This server is not affiliated with or endorsed by Bear (Shiny Frog Ltd.). It's an independent tool that provides access to the Bear database.
