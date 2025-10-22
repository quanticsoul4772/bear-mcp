import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BearURLSchemeResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Execute a Bear URL scheme command
 * @param scheme The Bear URL scheme (e.g., 'bear://x-callback-url/create')
 * @param params Object containing URL parameters
 * @returns Promise with result status and message
 */
export async function executeBearURLScheme(
  scheme: string,
  params: Record<string, string | number | boolean>,
  skipEncoding: string[] = []
): Promise<BearURLSchemeResult> {
  try {
    // Build query string from parameters
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        // For certain parameters like 'tags', don't encode to preserve special characters
        const encodedValue = skipEncoding.includes(key)
          ? String(value)
          : encodeURIComponent(String(value));
        return `${key}=${encodedValue}`;
      })
      .join('&');

    const fullURL = queryParams ? `${scheme}?${queryParams}` : scheme;

    // Log the URL being sent for debugging
    console.error('Bear URL:', fullURL);

    // Execute the URL scheme using the open command
    await execAsync(`open "${fullURL.replace(/"/g, '\\"')}"`);

    return {
      success: true,
      message: 'Bear command executed successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to execute Bear command',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Encode tags for Bear URL scheme
 * Tags can be provided as array or comma-separated string
 */
export function encodeTags(tags: string[] | string | undefined): string | undefined {
  if (!tags) return undefined;

  if (Array.isArray(tags)) {
    return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(',');
  }

  return tags;
}
