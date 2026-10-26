/// <reference types="jest" />
import { buildGradingMessages } from './grading-prompt';

describe('buildGradingMessages', () => {
  it('includes the scenario and the candidate answer in the user message', () => {
    const messages = buildGradingMessages(
      'Developers need read/write access to /var/www/app.',
      'chgrp -R developers /var/www/app && chmod -R 2775 /var/www/app',
    );

    const promptText = JSON.stringify(messages);
    expect(promptText).toContain('Developers need read/write access');
    expect(promptText).toContain('chgrp -R developers');
  });

  it('does not restrict grading to shell commands — the system message accepts written design/reasoning answers too', () => {
    const messages = buildGradingMessages(
      'Design a multi-agent system for incident response.',
      'I would use a triage agent that classifies the alert, then delegates to a specialist agent per subsystem, with a shared memory layer for context handoff.',
    );

    const systemMessage = messages.find((m) => m.role === 'system');
    expect(systemMessage?.content).not.toMatch(/linux\/devops/i);
    expect(systemMessage?.content).toMatch(/design|reasoning|written/i);

    const promptText = JSON.stringify(messages);
    expect(promptText).toContain('triage agent that classifies the alert');
  });

  it('returns exactly one system message and one user message', () => {
    const messages = buildGradingMessages('scenario', 'answer');

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
  });
});
