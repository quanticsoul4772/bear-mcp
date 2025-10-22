import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { openNoteTool, handleOpenNote } from "./openNote.js";
import { searchNotesTool, handleSearchNotes } from "./searchNotes.js";
import { getTagsTool, handleGetTags } from "./getTags.js";
import { openTagTool, handleOpenTag } from "./openTag.js";
import { getRecentNotesTool, handleGetRecentNotes } from "./getRecentNotes.js";
import { getPinnedNotesTool, handleGetPinnedNotes } from "./getPinnedNotes.js";
import { getNoteStatsTool, handleGetNoteStats } from "./getNoteStats.js";
import { getNotesByDateRangeTool, handleGetNotesByDateRange } from "./getNotesByDateRange.js";
import { createNoteTool, handleCreateNote } from "./createNote.js";
import { addTextTool, handleAddText } from "./addText.js";
import { trashNoteTool, handleTrashNote } from "./trashNote.js";
import { renameTagTool, handleRenameTag } from "./renameTag.js";
import { deleteTagTool, handleDeleteTag } from "./deleteTag.js";

export const tools: Tool[] = [
  openNoteTool,
  searchNotesTool,
  getTagsTool,
  openTagTool,
  getRecentNotesTool,
  getPinnedNotesTool,
  getNoteStatsTool,
  getNotesByDateRangeTool,
  createNoteTool,
  addTextTool,
  trashNoteTool,
  renameTagTool,
  deleteTagTool
];

export {
  handleOpenNote,
  handleSearchNotes,
  handleGetTags,
  handleOpenTag,
  handleGetRecentNotes,
  handleGetPinnedNotes,
  handleGetNoteStats,
  handleGetNotesByDateRange,
  handleCreateNote,
  handleAddText,
  handleTrashNote,
  handleRenameTag,
  handleDeleteTag
};
