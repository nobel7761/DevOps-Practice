import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

export const PLATFORM_NAME = 'One Step Closer Learning Platform';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT') ?? 587);
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    const fromName = config.get<string>('MAIL_FROM_NAME') ?? PLATFORM_NAME;
    const fromAddress = config.get<string>('SMTP_FROM') ?? user ?? '';

    this.from = `"${fromName}" <${fromAddress}>`;
    // No SMTP configured (local dev) → log the mail instead of failing the request.
    this.transporter = host
      ? createTransport({
          host,
          port,
          secure: port === 465,
          auth: user ? { user, pass } : undefined,
        })
      : null;
  }

  async sendPasswordReset(to: string, firstName: string, link: string) {
    const subject = `Reset your password — ${PLATFORM_NAME}`;
    const text = [
      `Hi ${firstName},`,
      '',
      `We received a request to reset your ${PLATFORM_NAME} password.`,
      `Open this link to choose a new one (valid for 30 minutes):`,
      link,
      '',
      `If you didn't ask for this, you can ignore this email.`,
      '',
      `— ${PLATFORM_NAME}`,
    ].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
        <h2 style="margin-bottom:4px">${PLATFORM_NAME}</h2>
        <p>Hi ${escapeHtml(firstName)},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link is valid for 30 minutes.</p>
        <p style="text-align:center;margin:28px 0">
          <a href="${link}" style="background:#111;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none">Reset password</a>
        </p>
        <p style="font-size:13px;color:#555">Or paste this link into your browser:<br>${link}</p>
        <p style="font-size:13px;color:#555">If you didn't ask for this, you can ignore this email.</p>
        <p>— ${PLATFORM_NAME}</p>
      </div>`;

    if (!this.transporter) {
      this.logger.warn(
        `SMTP_HOST not set — password reset link for ${to}: ${link}`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}
