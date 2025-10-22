import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";
import { formatDate } from "../types.js";

export const getPinnedNotesTool: Tool = {
  name: "get_pinned_notes",
  description: "Get all pinned Bear notes",
  inputSchema: {
    type: "object",
    properties: {
      sortBy: {
        type: "string",
        description: "Sort order: 'modified' (default) or 'created'",
        enum: ["modified", "created"],
        default: "modified"
      }
    }
  }
};

export async function handleGetPinnedNotes(bearDB: BearDB, args: any) {
  const sortBy = args.sortBy || 'modified';

  try {
    const notes = bearDB.getPinnedNotes(sortBy);
    
    if (notes.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No pinned notes found"
        }]
      };
    }

    const notesList = notes.map((note, index) => {
      const preview = note.content.substring(0, 150).replace(/\n/g, ' ');
      return `${index + 1}. **${note.title}** 📌
   Created: ${formatDate(note.creationDate)}
   Modified: ${formatDate(note.modificationDate)}
   Tags: ${note.tags.length > 0 ? note.tags.map(t => `#${t}`).join(', ') : 'None'}
   Preview: ${preview}${note.content.length > 150 ? '...' : ''}`;
    }).join('\n\n');

    return {
      content: [{
        type: "text",
        text: `# Pinned Notes (${notes.length})\n\n${notesList}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error getting pinned notes: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
