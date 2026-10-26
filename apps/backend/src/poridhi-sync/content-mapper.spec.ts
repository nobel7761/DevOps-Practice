/// <reference types="jest" />
import { toSyncedContentItem } from './content-mapper';
import type { PoridhiContentInfo, VidinfraMeta } from './poridhi-sync.types';

describe('toSyncedContentItem', () => {
  it('maps a lab entry to a SyncedContentItem with labId, no video fields', () => {
    const raw: PoridhiContentInfo = {
      id: '3ecf249e-4df4-4795-8d8c-8b913d68cdcc',
      type: 'lab',
      completed: true,
      info: {
        id: '57eae488-d8de-454b-86a8-9cfdc9e56fd4',
        title: 'Software Defined Networking (SDN)',
        labId: '69e0e99023b200e2a4159f0d',
        free: false,
      },
    };

    const result = toSyncedContentItem(raw, null);

    expect(result).toEqual({
      type: 'lab',
      title: 'Software Defined Networking (SDN)',
      completed: true,
      labId: '69e0e99023b200e2a4159f0d',
    });
  });

  it('maps a pre_class entry with video metadata to include contentId, videoUrl, and durationLabel', () => {
    const raw: PoridhiContentInfo = {
      id: '8088f145-43c1-44ac-9f98-8b2e70c98b76',
      type: 'pre_class',
      completed: true,
      info: {
        id: '76a9335a-40bd-4cc7-80b6-55ad117c3e0f',
        title: 'Software Defined Networking (SDN)',
      },
    };
    const videoMeta: VidinfraMeta = {
      durationSeconds: 4693,
      formattedDuration: '01:18:13',
      streamUrl:
        'https://81q1cu9eke.tenbytecdn.com/b4f52def-fd3d-431b-a1ce-47d0d728644f/playlist.m3u8',
    };

    const result = toSyncedContentItem(raw, videoMeta);

    expect(result).toEqual({
      type: 'pre_class',
      title: 'Software Defined Networking (SDN)',
      completed: true,
      contentId: '8088f145-43c1-44ac-9f98-8b2e70c98b76',
      videoUrl:
        'https://81q1cu9eke.tenbytecdn.com/b4f52def-fd3d-431b-a1ce-47d0d728644f/playlist.m3u8',
      durationLabel: '01:18:13',
    });
  });

  it('maps a pre_class entry with no video metadata to still carry contentId but no video fields', () => {
    const raw: PoridhiContentInfo = {
      id: '0074d264-9bd2-42bc-acf8-7b45034ba440',
      type: 'pre_class',
      completed: false,
      info: {
        id: 'e1cfe2ba-34b7-4dd2-a177-3596c6436371',
        title: 'Layer 2 Traffic Forwarding Setup in Mininet with OpenFlow',
      },
    };

    const result = toSyncedContentItem(raw, null);

    expect(result).toEqual({
      type: 'pre_class',
      title: 'Layer 2 Traffic Forwarding Setup in Mininet with OpenFlow',
      completed: false,
      contentId: '0074d264-9bd2-42bc-acf8-7b45034ba440',
    });
  });

  it('maps an ai_interview entry with just type/title/completed', () => {
    const raw: PoridhiContentInfo = {
      id: 'bf46883a-fae1-42f5-80df-fe4eb420cbd1',
      type: 'ai_interview',
      completed: true,
      info: {
        id: '034125bb-350d-49d4-9cf2-9d9d5744d551',
        title: 'Linux User & Access Management',
      },
    };

    const result = toSyncedContentItem(raw, null);

    expect(result).toEqual({
      type: 'ai_interview',
      title: 'Linux User & Access Management',
      completed: true,
    });
  });
});
