import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";

export const getTagsTool: Tool = {
  name: "get_tags",
  description: "Get all tags used in Bear notes",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export async function handleGetTags(bearDB: BearDB) {
  try {
    const tags = bearDB.getAllTags();
    
    if (tags.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No tags found in your Bear notes"
        }]
      };
    }

    let response = `Found ${tags.length} unique tag${tags.length !== 1 ? 's' : ''} in your Bear notes:\n\n`;
    
    // Group tags by frequency for better visualization
    const veryFrequent = tags.filter(t => t.noteCount >= 10);
    const frequent = tags.filter(t => t.noteCount >= 5 && t.noteCount < 10);
    const occasional = tags.filter(t => t.noteCount >= 2 && t.noteCount < 5);
    const rare = tags.filter(t => t.noteCount === 1);

    if (veryFrequent.length > 0) {
      response += '### Most Used Tags (10+ notes)\n';
      for (const tag of veryFrequent) {
        response += `- #${tag.name} (${tag.noteCount} notes)\n`;
      }
      response += '\n';
    }

    if (frequent.length > 0) {
      response += '### Frequently Used Tags (5-9 notes)\n';
      for (const tag of frequent) {
        response += `- #${tag.name} (${tag.noteCount} notes)\n`;
      }
      response += '\n';
    }

    if (occasional.length > 0) {
      response += '### Occasional Tags (2-4 notes)\n';
      for (const tag of occasional) {
        response += `- #${tag.name} (${tag.noteCount} notes)\n`;
      }
      response += '\n';
    }

    if (rare.length > 0) {
      response += '### Rare Tags (1 note)\n';
      const rareTagNames = rare.map(t => `#${t.name}`).join(', ');
      response += rareTagNames + '\n';
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
        text: `Error getting tags: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
