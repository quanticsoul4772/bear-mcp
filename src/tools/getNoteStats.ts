import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";

export const getNoteStatsTool: Tool = {
  name: "get_note_stats",
  description: "Get statistics about your Bear notes",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export async function handleGetNoteStats(bearDB: BearDB, args: any) {
  try {
    const stats = bearDB.getNoteStatistics();
    
    const response = `# Bear Notes Statistics

## Overview
- **Total Notes:** ${stats.totalNotes}
- **Pinned Notes:** ${stats.pinnedNotes}
- **Notes with Tags:** ${stats.notesWithTags}
- **Total Unique Tags:** ${stats.uniqueTags}
- **Average Note Length:** ${Math.round(stats.averageNoteLength)} characters

## Activity
- **Notes Created This Week:** ${stats.notesCreatedThisWeek}
- **Notes Modified This Week:** ${stats.notesModifiedThisWeek}
- **Notes Created This Month:** ${stats.notesCreatedThisMonth}
- **Notes Modified This Month:** ${stats.notesModifiedThisMonth}

## Top Tags
${stats.topTags.map((tag: any, index: number) => 
  `${index + 1}. **#${tag.name}** (${tag.noteCount} notes)`
).join('\n')}

## Note Length Distribution
- **Very Short (<100 chars):** ${stats.noteLengthDistribution.veryShort}
- **Short (100-500 chars):** ${stats.noteLengthDistribution.short}
- **Medium (500-2000 chars):** ${stats.noteLengthDistribution.medium}
- **Long (2000-5000 chars):** ${stats.noteLengthDistribution.long}
- **Very Long (>5000 chars):** ${stats.noteLengthDistribution.veryLong}`;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error getting statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
