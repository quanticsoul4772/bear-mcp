import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeBearURLScheme, encodeTags } from "./urlSchemeUtils.js";

export const createNoteTool: Tool = {
  name: "create_note",
  description: "Create a new note in Bear",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the new note"
      },
      content: {
        type: "string",
        description: "Content of the note (supports Markdown)"
      },
      tags: {
        anyOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ],
        description: "Tags as comma-separated string or array (with or without # prefix)"
      },
      pin: {
        type: "boolean",
        description: "Whether to pin the note (default: false)"
      }
    },
    required: ["content"]
  }
};

export async function handleCreateNote(args: any) {
  const { title, content, tags, pin } = args;

  if (!content || typeof content !== 'string') {
    return {
      content: [{
        type: "text",
        text: "Error: Content is required"
      }]
    };
  }

  try {
    // Build note text with title if provided
    let noteText = content;
    if (title) {
      noteText = `# ${title}\n\n${content}`;
    }

    const params: Record<string, string | number> = {
      text: noteText
    };

    if (tags) {
      // Handle tags whether they come as string or array
      // Bear expects tags WITHOUT # prefix in the URL parameter
      // Bear will add the # automatically
      let tagString: string;
      if (Array.isArray(tags)) {
        tagString = tags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag).join(',');
      } else if (typeof tags === 'string') {
        // Split by comma if multiple tags provided
        const tagArray = tags.split(',').map(t => t.trim());
        tagString = tagArray.map(tag => tag.startsWith('#') ? tag.substring(1) : tag).join(',');
      } else {
        tagString = '';
      }

      if (tagString) {
        params.tags = tagString;
      }
    }

    if (pin) {
      params.pin = 'yes';
    }

    const result = await executeBearURLScheme('bear://x-callback-url/create', params);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: `Note created successfully${title ? `: ${title}` : ''}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `Failed to create note: ${result.error || result.message}`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error creating note: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
