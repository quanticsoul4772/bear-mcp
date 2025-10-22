import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { BearDB } from "../bearDB.js";
import { formatDate } from "../types.js";

export const getNotesByDateRangeTool: Tool = {
  name: "get_notes_by_date",
  description: "Get Bear notes created or modified within a date range",
  inputSchema: {
    type: "object",
    properties: {
      startDate: {
        type: "string",
        description: "Start date in ISO format (YYYY-MM-DD)"
      },
      endDate: {
        type: "string",
        description: "End date in ISO format (YYYY-MM-DD)"
      },
      dateType: {
        type: "string",
        description: "Filter by 'created' or 'modified' date",
        enum: ["created", "modified"],
        default: "modified"
      },
      limit: {
        type: "number",
        description: "Maximum number of notes to return",
        minimum: 1,
        maximum: 100,
        default: 20
      }
    },
    required: ["startDate", "endDate"]
  }
};

export async function handleGetNotesByDateRange(bearDB: BearDB, args: any) {
  const { startDate, endDate, dateType = 'modified', limit = 20 } = args;

  if (!startDate || !endDate) {
    return {
      content: [{
        type: "text",
        text: "Error: Please provide both startDate and endDate"
      }]
    };
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        content: [{
          type: "text",
          text: "Error: Invalid date format. Please use YYYY-MM-DD"
        }]
      };
    }

    if (start > end) {
      return {
        content: [{
          type: "text",
          text: "Error: Start date must be before end date"
        }]
      };
    }

    const notes = bearDB.getNotesByDateRange(start, end, dateType, limit);
    
    if (notes.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No notes found between ${startDate} and ${endDate}`
        }]
      };
    }

    const notesList = notes.map((note, index) => {
      const preview = note.content.substring(0, 100).replace(/\n/g, ' ');
      const dateToShow = dateType === 'created' ? note.creationDate : note.modificationDate;
      
      return `${index + 1}. **${note.title}**
   ${dateType === 'created' ? 'Created' : 'Modified'}: ${formatDate(dateToShow)}
   Tags: ${note.tags.length > 0 ? note.tags.map(t => `#${t}`).join(', ') : 'None'}
   Preview: ${preview}${note.content.length > 100 ? '...' : ''}`;
    }).join('\n\n');

    const header = `# Notes ${dateType === 'created' ? 'Created' : 'Modified'} Between ${startDate} and ${endDate}
Found ${notes.length} note${notes.length !== 1 ? 's' : ''}

${notesList}`;

    return {
      content: [{
        type: "text",
        text: header
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error getting notes by date: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}
