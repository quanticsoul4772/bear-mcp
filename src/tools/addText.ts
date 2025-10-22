import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeBearURLScheme } from "./urlSchemeUtils.js";

export const addTextTool: Tool = {
  name: "add_text",
  description: "Add text to an existing Bear note",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The unique identifier of the note"
      },
      text: {
        type: "string",
        description: "The text to add (supports Markdown)"
      },
      mode: {
        type: "string",
        enum: ["append", "prepend", "replace"],
        description: "How to add the text: append (default), prepend, or replace entire note"
      },
      openNote: {
        type: "boolean",
        description: "Whether to open the note after adding text (default: false)"
      }
    },
    required: ["id", "text"]
  }
};

export async function handleAddText(args: any) {
  const { id, text, mode = "append", openNote = false } = args;

  if (!id || typeof id !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Note ID is required"
      }]
    };
  }

  if (!text || typeof text !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Text to add is required"
      }]
    };
  }

  if (!["append", "prepend", "replace"].includes(mode)) {
    return {
      content: [{
        type: "text",
        text: "Error: Mode must be 'append', 'prepend', or 'replace'"
      }]
    };
  }

  try {
    const params: Record<string, string | number> = {
      id,
      text,
      mode
    };

    if (openNote) {
      params.open_note = 'yes';
    }

    const result = await executeBearURLScheme('bear://x-callback-url/add-text', params);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: `Text ${mode}ed to note successfully`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `Failed to add text to note: ${result.error || result.message}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error adding text to note: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
