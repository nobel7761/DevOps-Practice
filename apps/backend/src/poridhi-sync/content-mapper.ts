import {
  PoridhiContentInfo,
  SyncedContentItem,
  VidinfraMeta,
} from './poridhi-sync.types';

export function toSyncedContentItem(
  raw: PoridhiContentInfo,
  videoMeta: VidinfraMeta | null,
): SyncedContentItem {
  const base: SyncedContentItem = {
    type: raw.type,
    title: raw.info.title,
    completed: raw.completed,
  };

  if (raw.type === 'lab') {
    return raw.info.labId ? { ...base, labId: raw.info.labId } : base;
  }

  if (raw.type === 'pre_class' || raw.type === 'live_class') {
    const withContentId: SyncedContentItem = { ...base, contentId: raw.id };
    return videoMeta
      ? {
          ...withContentId,
          videoUrl: videoMeta.streamUrl,
          durationLabel: videoMeta.formattedDuration,
        }
      : withContentId;
  }

  return base;
}
