import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeBearURLScheme } from "./urlSchemeUtils.js";

export const renameTagTool: Tool = {
  name: "rename_tag",
  description: "Rename a tag across all Bear notes",
  inputSchema: {
    type: "object",
    properties: {
      oldName: {
        type: "string",
        description: "Current tag name (with or without # prefix)"
      },
      newName: {
        type: "string",
        description: "New tag name (with or without # prefix)"
      }
    },
    required: ["oldName", "newName"]
  }
};

export async function handleRenameTag(args: any) {
  const { oldName, newName } = args;

  if (!oldName || typeof oldName !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Current tag name (oldName) is required"
      }]
    };
  }

  if (!newName || typeof newName !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: New tag name (newName) is required"
      }]
    };
  }

  try {
    // Remove # prefix if present for consistency
    const cleanOldName = oldName.startsWith('#') ? oldName.substring(1) : oldName;
    const cleanNewName = newName.startsWith('#') ? newName.substring(1) : newName;

    console.error(`Renaming tag: "${cleanOldName}" -> "${cleanNewName}"`);

    const params = {
      name: cleanOldName,
      new_name: cleanNewName
    };

    const result = await executeBearURLScheme('bear://x-callback-url/rename-tag', params);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: `Tag renamed successfully: #${cleanOldName} → #${cleanNewName}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `Failed to rename tag: ${result.error || result.message}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error renaming tag: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
