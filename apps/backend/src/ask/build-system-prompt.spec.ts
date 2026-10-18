/// <reference types="jest" />
import { buildSystemPrompt } from './build-system-prompt';

describe('buildSystemPrompt', () => {
  it('includes the video title and golpo essay when provided', () => {
    const prompt = buildSystemPrompt({
      videoTitle: 'Introduction To Linux Pipes & Grep',
      golpoMarkdown: '## শুরুর গল্প\nধরো তোমার বাসায় একটা পানির ট্যাংক আছে।',
    });

    expect(prompt).toContain('Introduction To Linux Pipes & Grep');
    expect(prompt).toContain('ধরো তোমার বাসায় একটা পানির ট্যাংক আছে।');
  });

  it('includes each lab title and intro when labs are provided', () => {
    const prompt = buildSystemPrompt({
      videoTitle: 'X',
      labs: [
        {
          title: 'Linux Pipes and I/O Redirection',
          intro: 'Practice piping commands.',
        },
        {
          title: 'Pattern Matching with Regex',
          intro: 'Use grep to find patterns.',
        },
      ],
    });

    expect(prompt).toContain('Linux Pipes and I/O Redirection');
    expect(prompt).toContain('Practice piping commands.');
    expect(prompt).toContain('Pattern Matching with Regex');
    expect(prompt).toContain('Use grep to find patterns.');
  });

  it('omits the labs section when no labs are provided', () => {
    const prompt = buildSystemPrompt({ videoTitle: 'X', labs: [] });
    expect(prompt.toLowerCase()).not.toContain('lab');
  });

  it('includes interview question titles and scenarios when an interview is provided', () => {
    const prompt = buildSystemPrompt({
      videoTitle: 'X',
      interview: {
        title: 'Linux User & Access Management',
        questions: [
          {
            title: 'Fix Directory Access',
            scenario: 'A user cannot read their home directory.',
          },
        ],
      },
    });

    expect(prompt).toContain('Linux User & Access Management');
    expect(prompt).toContain('Fix Directory Access');
    expect(prompt).toContain('A user cannot read their home directory.');
  });

  it('omits the interview section when no interview is provided', () => {
    const prompt = buildSystemPrompt({ videoTitle: 'X' });
    expect(prompt.toLowerCase()).not.toContain('interview');
  });
});
