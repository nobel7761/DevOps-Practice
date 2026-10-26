export type SyncedContentType =
  | 'lab'
  | 'pre_class'
  | 'live_class'
  | 'ai_interview'
  | 'ai_exam'
  | 'project_submission';

/** One entry from poridhi.io's `.../module/{moduleId}/contents` response. */
export interface PoridhiContentInfo {
  id: string;
  type: SyncedContentType;
  completed: boolean;
  info: {
    id: string;
    title: string;
    labId?: string;
    free?: boolean;
  };
}

/** Extracted from the vidinfra player page's embedded `playerConfig`. */
export interface VidinfraMeta {
  durationSeconds: number;
  formattedDuration: string;
  streamUrl: string;
}

/** Our own normalized shape, mirrors the frontend's CourseContentItem. */
export interface SyncedContentItem {
  type: SyncedContentType;
  title: string;
  completed: boolean;
  labId?: string;
  contentId?: string;
  videoUrl?: string;
  durationLabel?: string;
}
