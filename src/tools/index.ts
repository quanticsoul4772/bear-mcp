import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { openNoteTool, handleOpenNote } from "./openNote.js";
import { searchNotesTool, handleSearchNotes } from "./searchNotes.js";
import { getTagsTool, handleGetTags } from "./getTags.js";
import { openTagTool, handleOpenTag } from "./openTag.js";

export const tools: Tool[] = [
  openNoteTool,
  searchNotesTool,
  getTagsTool,
  openTagTool
];

export {
  handleOpenNote,
  handleSearchNotes,
  handleGetTags,
  handleOpenTag
};
