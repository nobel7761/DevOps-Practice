/// <reference types="jest" />
import { parseVidinfraPlayerHtml } from './vidinfra-player';

// Trimmed excerpt of a real player.vidinfra.com/stream/.../... response —
// the part that matters (the embedded playerConfig script), with everything
// else that doesn't affect parsing removed.
const REAL_PLAYER_HTML = `<!doctype html><html><head><title>Orientation Class - MASTERING AWS &amp; DEVOPS S4 .mp4</title></head><body><div id="tenbyte-player"></div><script src="/stream/public/js/index.global.js"></script><script>
				const playerConfig = {"video":{"id":"fd58468d-91b0-4baa-8d6d-47ba285b4570","libraryId":"d73529b3-a572-4d08-b726-61e469f40d7d","collectionId":"6e569206-7c18-4db8-b7ff-385dfc859ea8","title":"Orientation Class - MASTERING AWS \\u0026 DEVOPS S4 .mp4","description":"","duration":4693,"thumbnail":"https://81q1cu9eke.tenbytecdn.com/b4f52def-fd3d-431b-a1ce-47d0d728644f/thumbnail.jpg","source":"https://81q1cu9eke.tenbytecdn.com/b4f52def-fd3d-431b-a1ce-47d0d728644f/playlist.m3u8","adTag":"","formatted_duration":"01:18:13","preview_animation_thumbnail_url":"https://81q1cu9eke.tenbytecdn.com/b4f52def-fd3d-431b-a1ce-47d0d728644f/preview.webp","status":"playable","enable_watermark":false,"referrer_policy":{"enabled":false}},"player":{"id":"2f57f7ee-711e-4dc9-93c5-b6ea888ac2b3"}};
				TenbytePlayer.create({ target: "#tenbyte-player" });
			</script></body></html>`;

describe('parseVidinfraPlayerHtml', () => {
  it('extracts duration, formatted duration, and the real stream URL from a real player page', () => {
    const result = parseVidinfraPlayerHtml(REAL_PLAYER_HTML);

    expect(result).toEqual({
      durationSeconds: 4693,
      formattedDuration: '01:18:13',
      streamUrl:
        'https://81q1cu9eke.tenbytecdn.com/b4f52def-fd3d-431b-a1ce-47d0d728644f/playlist.m3u8',
    });
  });

  it('returns null when the page has no playerConfig (e.g. an error page)', () => {
    const result = parseVidinfraPlayerHtml(
      '<html><body>Not found</body></html>',
    );

    expect(result).toBeNull();
  });
});
