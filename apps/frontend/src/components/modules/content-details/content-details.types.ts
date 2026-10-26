export interface SyncedContentItem {
  type: string;
  title: string;
  completed: boolean;
  labId?: string;
  contentId?: string;
  videoUrl?: string;
  durationLabel?: string;
}

export interface SyncedModule {
  id: string;
  title: string;
  contents: SyncedContentItem[];
}

export interface SyncedMilestone {
  id: string;
  title: string;
  modules: SyncedModule[];
}

export interface SyncedCourseData {
  courseId: string;
  milestones: SyncedMilestone[];
  fetchedAt: string;
}

export interface SyncStatus {
  hasToken: boolean;
  lastFetchedAt: string | null;
}
