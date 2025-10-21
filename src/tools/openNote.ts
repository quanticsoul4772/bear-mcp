import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";
import { formatDate } from "../types.js";

export const openNoteTool: Tool = {
  name: "open_note",
  description: "Open a Bear note by title or ID",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Note title or ID to open"
      }
    },
    required: ["query"]
  }
};

export async function handleOpenNote(bearDB: BearDB, args: any) {
  const { query } = args;
  
  if (!query || typeof query !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Please provide a note title or ID"
      }]
    };
  }

  try {
    const note = bearDB.getNoteByTitleOrId(query);
    
    if (!note) {
      return {
        content: [{
          type: "text",
          text: `No note found with title or ID: "${query}"`
        }]
      };
    }

    const response = `# ${note.title}

${note.content}

---
**Tags:** ${note.tags.length > 0 ? note.tags.map(t => `#${t}`).join(', ') : 'None'}
**Created:** ${formatDate(note.creationDate)}
**Modified:** ${formatDate(note.modificationDate)}
**ID:** ${note.id}`;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error opening note: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
