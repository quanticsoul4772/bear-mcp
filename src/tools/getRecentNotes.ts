import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";
import { formatDate } from "../types.js";

export const getRecentNotesTool: Tool = {
  name: "get_recent_notes",
  description: "Get recently modified Bear notes",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Number of notes to return (default: 10, max: 50)",
        minimum: 1,
        maximum: 50,
        default: 10
      },
      includePinned: {
        type: "boolean",
        description: "Include pinned notes in results (default: true)",
        default: true
      }
    }
  }
};

export async function handleGetRecentNotes(bearDB: BearDB, args: any) {
  const limit = Math.min(args.limit || 10, 50);
  const includePinned = args.includePinned !== false;

  try {
    const notes = bearDB.getRecentNotes({ limit, includePinned });
    
    if (notes.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No recent notes found"
        }]
      };
    }

    const notesList = notes.map((note, index) => {
      const preview = note.content.substring(0, 100).replace(/\n/g, ' ');
      return `${index + 1}. **${note.title}**
   Modified: ${formatDate(note.modificationDate)}
   Tags: ${note.tags.length > 0 ? note.tags.map(t => `#${t}`).join(', ') : 'None'}
   Preview: ${preview}${note.content.length > 100 ? '...' : ''}
   ${note.isPinned ? '📌 Pinned' : ''}`;
    }).join('\n\n');

    return {
      content: [{
        type: "text",
        text: `# Recent Notes (${notes.length})\n\n${notesList}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error getting recent notes: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
