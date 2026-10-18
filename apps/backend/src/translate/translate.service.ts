import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type OpenAI from 'openai';
import { OPENAI_CLIENT } from '../openai/openai-client.provider';
import {
  TranslationCache,
  TranslationCacheDocument,
} from './schemas/translation-cache.schema';
import { TranslatableQuestion } from './translate.types';

const TERMINOLOGY_RULE =
  'Keep standard Linux/DevOps/CS technical terms spelled in actual English ' +
  'letters (Latin script) — do NOT translate them into native Bengali words, ' +
  'and do NOT transliterate them into Bengali script either, even inside an ' +
  'otherwise-Bengali sentence. This is the normal code-mixed style Bengali ' +
  'developers actually use: they read the jargon in English and the ' +
  'explanation in Bengali. This covers words like: home, directory, file, ' +
  'folder, permission, group, user, owner, root, password, access, service, ' +
  'process, log, shell, command, flag, and similar jargon. For example, "home ' +
  'directory" must read as "home ডিরেক্টরি" — "home" stays spelled in English ' +
  'letters (NOT as হোম, which is just Bengali-script spelling of the same word ' +
  'and defeats the point), and "ডিরেক্টরি" is the normal Bengali-script word ' +
  'Bengali developers already use for "directory". NEVER "বাড়ির ডিরেক্টরি" ' +
  '(translating "home" to the native word বাড়ির/house is wrong here — this is a ' +
  'technical term, not a sentence about an actual house). So for each of these ' +
  'jargon words: keep it in English letters if that is how Bengali developers ' +
  'normally say it (home, file, user, access, permission, root, password, ' +
  'etc.), and only use an already-established Bengali-script tech word ' +
  '(ডিরেক্টরি, ফোল্ডার) when that specific word is the one Bengali developers ' +
  'themselves normally write in Bengali script. When in doubt, prefer English ' +
  'letters. Only the connecting grammar, explanations, and sentence structure ' +
  'around these terms should be Bengali.';

const MARKDOWN_SYSTEM_PROMPT =
  'You are translating a technical Linux/DevOps lab tutorial from English to ' +
  'Bengali (বাংলা) for a learner. Translate ONLY the natural-language prose — ' +
  'headings, paragraphs, list item text, blockquotes, and explanatory sentences — ' +
  'into natural, clear Bengali. Do NOT translate or alter: code blocks (text ' +
  'between triple backticks), inline code (between single backticks), shell ' +
  'commands, flag names, file paths, URLs, or image references in markdown image ' +
  'syntax. ' +
  TERMINOLOGY_RULE +
  ' Keep the exact same markdown structure and formatting — same headings, ' +
  'same code blocks verbatim, same line breaks. Output ONLY the translated ' +
  'markdown, nothing else (no commentary, no code fence wrapping the whole output).';

const QUESTIONS_SYSTEM_PROMPT =
  'Translate each question\'s "title" and "scenario" fields from English to ' +
  'natural, clear Bengali for a Linux/DevOps interview. Translate the FULL ' +
  'sentence(s) of every "scenario" — do not leave it in English. Specific ' +
  'non-jargon tokens embedded in the sentence — file paths (e.g. /var/www/app), ' +
  'usernames (e.g. dev3), and literal command names — stay in English exactly ' +
  'as written, while the surrounding Bengali sentence is translated around ' +
  'them. For example, "Developers need read/write access to /var/www/app." ' +
  'becomes "ডেভেলপারদের /var/www/app-এ read/write access দরকার।" — translated ' +
  'prose with the path (and jargon, per the rule below) left in English, never ' +
  'the whole sentence left untranslated. ' +
  TERMINOLOGY_RULE +
  ' Respond with ONLY a JSON object of the exact shape {"questions": [{"id": ' +
  '..., "title": ..., "scenario": ...}, ...]}, same order, same ids, as the input.';

@Injectable()
export class TranslateService {
  constructor(
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
    @InjectModel(TranslationCache.name)
    private readonly cacheModel: Model<TranslationCacheDocument>,
  ) {}

  private async getCached(key: string): Promise<string | null> {
    const doc = await this.cacheModel.findOne({ key }).exec();
    return doc?.payload ?? null;
  }

  private async setCached(key: string, payload: string): Promise<void> {
    await this.cacheModel
      .findOneAndUpdate({ key }, { key, payload }, { upsert: true })
      .exec();
  }

  async translateLabMarkdown(labId: string, markdown: string): Promise<string> {
    const key = `lab:${labId}`;
    const cached = await this.getCached(key);
    if (cached !== null) return cached;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: MARKDOWN_SYSTEM_PROMPT },
        { role: 'user', content: markdown },
      ],
    });
    const translated = completion.choices[0]?.message?.content ?? markdown;
    await this.setCached(key, translated);
    return translated;
  }

  async translateInterviewQuestions(
    moduleId: string,
    questions: TranslatableQuestion[],
  ): Promise<TranslatableQuestion[]> {
    const key = `interview:${moduleId}`;
    const cached = await this.getCached(key);
    if (cached !== null) return JSON.parse(cached);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: QUESTIONS_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify({ questions }) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const translated: TranslatableQuestion[] = Array.isArray(parsed.questions)
      ? parsed.questions
      : questions;
    await this.setCached(key, JSON.stringify(translated));
    return translated;
  }
}
