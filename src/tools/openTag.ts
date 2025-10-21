import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";
import { formatDate } from "../types.js";

export const openTagTool: Tool = {
  name: "open_tag",
  description: "Show all Bear notes with a specific tag",
  inputSchema: {
    type: "object",
    properties: {
      tag: {
        type: "string",
        description: "Tag name to filter by (without the # symbol)"
      }
    },
    required: ["tag"]
  }
};

export async function handleOpenTag(bearDB: BearDB, args: any) {
  const { tag } = args;
  
  if (!tag || typeof tag !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Please provide a tag name"
      }]
    };
  }

  try {
    const notes = bearDB.getNotesByTag(tag);
    
    if (notes.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No notes found with tag #${tag}`
        }]
      };
    }

    let response = `# Notes tagged with #${tag}\n\n`;
    response += `Found ${notes.length} note${notes.length !== 1 ? 's' : ''}:\n\n`;

    for (const note of notes) {
      // Create a preview (first 200 characters of content)
      const preview = note.content
        .replace(/\n/g, ' ')
        .substring(0, 200)
        .trim();
      
      response += `## ${note.title}\n`;
      response += `${preview}${note.content.length > 200 ? '...' : ''}\n`;
      
      // Show other tags (excluding the searched tag)
      const otherTags = note.tags.filter(t => t !== tag);
      if (otherTags.length > 0) {
        response += `**Other tags:** ${otherTags.map(t => `#${t}`).join(', ')}\n`;
      }
      
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
        text: `Error getting notes by tag: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
