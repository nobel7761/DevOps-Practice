import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PoridhiToken,
  PoridhiTokenDocument,
} from './schemas/poridhi-token.schema';
import {
  SyncedCourse,
  SyncedCourseDocument,
  SyncedMilestone,
  SyncedModule,
} from './schemas/synced-course.schema';
import { toSyncedContentItem } from './content-mapper';
import { parseVidinfraPlayerHtml } from './vidinfra-player';
import { PoridhiContentInfo, SyncedContentItem } from './poridhi-sync.types';

const ROADMAP_BASE = 'https://iam.api.poridhi.io/course/api/v3/course/roadmap';
const CONTENT_BASE = 'https://iam.api.poridhi.io/course/api/v3/course/content';
// poridhi.io's own internal _id for "MASTERING AWS & DEVOPS SEASON 4" —
// distinct from this app's registry slug ("devops-season-4").
const DEVOPS_SEASON_4_POSTHDI_COURSE_ID = '69a090fa3a34cc047c253fb7';
const DEVOPS_SEASON_4_REGISTRY_ID = 'devops-season-4';
const TOKEN_ID = 'singleton';
const VIDEO_FETCH_CONCURRENCY = 5;

interface RoadmapMilestone {
  id: string;
  title: string;
}

interface RoadmapModulesResponse {
  modulesInfo: { id: string; title: string }[];
}

interface RoadmapContentsResponse {
  contentsInfo: PoridhiContentInfo[];
}

interface ContentDetailResponse {
  info: { video_url?: string };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await fn(items[index]);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

@Injectable()
export class PoridhiSyncService {
  private readonly logger = new Logger(PoridhiSyncService.name);

  constructor(
    @InjectModel(PoridhiToken.name)
    private readonly tokenModel: Model<PoridhiTokenDocument>,
    @InjectModel(SyncedCourse.name)
    private readonly courseModel: Model<SyncedCourseDocument>,
  ) {}

  async saveToken(token: string): Promise<{ saved: true }> {
    await this.tokenModel
      .findOneAndUpdate(
        { key: TOKEN_ID },
        { key: TOKEN_ID, token },
        { upsert: true },
      )
      .exec();
    return { saved: true };
  }

  async getStatus() {
    const [tokenDoc, courseDoc] = await Promise.all([
      this.tokenModel.findOne({ key: TOKEN_ID }).exec(),
      this.courseModel
        .findOne({ courseId: DEVOPS_SEASON_4_REGISTRY_ID })
        .exec(),
    ]);
    return {
      hasToken: !!tokenDoc,
      lastFetchedAt: courseDoc?.fetchedAt ?? null,
    };
  }

  async getLatest() {
    return this.courseModel
      .findOne({ courseId: DEVOPS_SEASON_4_REGISTRY_ID })
      .exec();
  }

  private async fetchJson<T>(url: string, token: string): Promise<T> {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (res.status === 401) {
      throw new UnauthorizedException(
        'poridhi.io token expired বা invalid — একটা fresh token paste করুন।',
      );
    }
    if (!res.ok) {
      throw new Error(`poridhi.io API error ${res.status} for ${url}`);
    }
    return res.json() as Promise<T>;
  }

  private async fetchVideoMeta(playerUrl: string) {
    try {
      const res = await fetch(playerUrl);
      if (!res.ok) return null;
      return parseVidinfraPlayerHtml(await res.text());
    } catch (err) {
      this.logger.warn(`Failed to fetch video meta from ${playerUrl}: ${err}`);
      return null;
    }
  }

  private async toContentItem(
    raw: PoridhiContentInfo,
    moduleId: string,
    token: string,
  ): Promise<SyncedContentItem> {
    if (raw.type !== 'pre_class' && raw.type !== 'live_class') {
      return toSyncedContentItem(raw, null);
    }

    try {
      const detail = await this.fetchJson<ContentDetailResponse>(
        `${CONTENT_BASE}/${DEVOPS_SEASON_4_POSTHDI_COURSE_ID}/module/${moduleId}/content/${raw.type}/${raw.id}`,
        token,
      );
      const videoMeta = detail.info.video_url
        ? await this.fetchVideoMeta(detail.info.video_url)
        : null;
      return toSyncedContentItem(raw, videoMeta);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`Failed to fetch detail for content ${raw.id}: ${err}`);
      return toSyncedContentItem(raw, null);
    }
  }

  async fetchLatestContents(): Promise<{
    milestones: SyncedMilestone[];
    fetchedAt: Date;
  }> {
    const tokenDoc = await this.tokenModel.findOne({ key: TOKEN_ID }).exec();
    if (!tokenDoc) {
      throw new UnauthorizedException(
        'এখনো কোনো poridhi.io token save করা হয়নি — প্রথমে token paste করুন।',
      );
    }
    const token = tokenDoc.token;

    const milestones = await this.fetchJson<RoadmapMilestone[]>(
      `${ROADMAP_BASE}/${DEVOPS_SEASON_4_POSTHDI_COURSE_ID}/milestones`,
      token,
    );

    const syncedMilestones: SyncedMilestone[] = [];

    for (const milestone of milestones) {
      const { modulesInfo } = await this.fetchJson<RoadmapModulesResponse>(
        `${ROADMAP_BASE}/${DEVOPS_SEASON_4_POSTHDI_COURSE_ID}/milestone/${milestone.id}/modules`,
        token,
      );

      const syncedModules: SyncedModule[] = [];

      for (const moduleInfo of modulesInfo) {
        const { contentsInfo } = await this.fetchJson<RoadmapContentsResponse>(
          `${ROADMAP_BASE}/${DEVOPS_SEASON_4_POSTHDI_COURSE_ID}/milestone/${milestone.id}/module/${moduleInfo.id}/contents`,
          token,
        );

        const contents = await mapWithConcurrency(
          contentsInfo,
          VIDEO_FETCH_CONCURRENCY,
          (raw) => this.toContentItem(raw, moduleInfo.id, token),
        );

        syncedModules.push({
          id: moduleInfo.id,
          title: moduleInfo.title,
          contents,
        });
      }

      syncedMilestones.push({
        id: milestone.id,
        title: milestone.title,
        modules: syncedModules,
      });
    }

    const fetchedAt = new Date();
    await this.courseModel
      .findOneAndUpdate(
        { courseId: DEVOPS_SEASON_4_REGISTRY_ID },
        {
          courseId: DEVOPS_SEASON_4_REGISTRY_ID,
          milestones: syncedMilestones,
          fetchedAt,
        },
        { upsert: true },
      )
      .exec();

    return { milestones: syncedMilestones, fetchedAt };
  }
}
