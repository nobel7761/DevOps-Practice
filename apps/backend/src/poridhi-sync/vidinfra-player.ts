import { VidinfraMeta } from './poridhi-sync.types';

// The vidinfra player page (player.vidinfra.com/stream/...) server-renders a
// `const playerConfig = {...};` object straight into the HTML — no JS
// execution needed to read duration/stream URL out of it.
const PLAYER_CONFIG_PATTERN = /const playerConfig = (\{.*?\});/s;

export function parseVidinfraPlayerHtml(html: string): VidinfraMeta | null {
  const match = PLAYER_CONFIG_PATTERN.exec(html);
  if (!match) return null;

  let config: unknown;
  try {
    config = JSON.parse(match[1]);
  } catch {
    return null;
  }

  const video = (config as { video?: Record<string, unknown> })?.video;
  if (
    !video ||
    typeof video.duration !== 'number' ||
    typeof video.formatted_duration !== 'string' ||
    typeof video.source !== 'string'
  ) {
    return null;
  }

  return {
    durationSeconds: video.duration,
    formattedDuration: video.formatted_duration,
    streamUrl: video.source,
  };
}
