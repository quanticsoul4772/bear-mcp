import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeBearURLScheme } from "./urlSchemeUtils.js";

export const trashNoteTool: Tool = {
  name: "trash_note",
  description: "Move a Bear note to trash",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The unique identifier of the note to trash"
      }
    },
    required: ["id"]
  }
};

export async function handleTrashNote(args: any) {
  const { id } = args;

  if (!id || typeof id !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Note ID is required"
      }]
    };
  }

  try {
    const params = { id };

    const result = await executeBearURLScheme('bear://x-callback-url/trash', params);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: `Note moved to trash successfully`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `Failed to trash note: ${result.error || result.message}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error trashing note: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
