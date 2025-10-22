import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeBearURLScheme } from "./urlSchemeUtils.js";

export const deleteTagTool: Tool = {
  name: "delete_tag",
  description: "Delete a tag from all Bear notes",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Tag name to delete (with or without # prefix)"
      }
    },
    required: ["name"]
  }
};

export async function handleDeleteTag(args: any) {
  const { name } = args;

  if (!name || typeof name !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Tag name is required"
      }]
    };
  }

  try {
    // Remove # prefix if present for consistency
    const cleanName = name.startsWith('#') ? name.substring(1) : name;

    const params = { name: cleanName };

    const result = await executeBearURLScheme('bear://x-callback-url/delete-tag', params);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: `Tag deleted successfully: #${cleanName}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `Failed to delete tag: ${result.error || result.message}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error deleting tag: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
