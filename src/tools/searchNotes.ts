import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";
import { formatDate } from "../types.js";

export const searchNotesTool: Tool = {
  name: "search_notes",
  description: "Search for Bear notes by term or tag",
  inputSchema: {
    type: "object",
    properties: {
      term: {
        type: "string",
        description: "Search term to find in note titles and content"
      },
      tag: {
        type: "string",
        description: "Tag to filter notes by (without the # symbol)"
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 20)",
        default: 20
      }
    }
  }
};

export async function handleSearchNotes(bearDB: BearDB, args: any) {
  const { term, tag, limit = 20 } = args;
  
  if (!term && !tag) {
    return {
      content: [{
        type: "text",
        text: "Error: Please provide either a search term or a tag"
      }]
    };
  }

  try {
    const notes = bearDB.searchNotes({ term, tag, limit });
    
    if (notes.length === 0) {
      let message = "No notes found";
      if (term && tag) {
        message += ` matching "${term}" with tag #${tag}`;
      } else if (term) {
        message += ` matching "${term}"`;
      } else {
        message += ` with tag #${tag}`;
      }
      
      return {
        content: [{
          type: "text",
          text: message
        }]
      };
    }

    let response = `Found ${notes.length} note${notes.length !== 1 ? 's' : ''}`;
    if (term && tag) {
      response += ` matching "${term}" with tag #${tag}`;
    } else if (term) {
      response += ` matching "${term}"`;
    } else {
      response += ` with tag #${tag}`;
    }
    response += ':\n\n';

    for (const note of notes) {
      // Create a preview (first 150 characters of content)
      const preview = note.content
        .replace(/\n/g, ' ')
        .substring(0, 150)
        .trim();
      
      response += `## ${note.title}\n`;
      response += `${preview}${note.content.length > 150 ? '...' : ''}\n`;
      response += `**Tags:** ${note.tags.length > 0 ? note.tags.map(t => `#${t}`).join(', ') : 'None'}\n`;
      response += `**Modified:** ${formatDate(note.modificationDate)}\n`;
      response += `**ID:** ${note.id}\n\n`;
    }

    return {
      content: [{
        type: "text",
        text: response.trim()
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error searching notes: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
