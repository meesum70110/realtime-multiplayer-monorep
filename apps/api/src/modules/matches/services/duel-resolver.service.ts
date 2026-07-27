import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MockDuelResolveResponse } from '../types/mock-duel-resolve-response.type';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_TIMEOUT_MS = 8_000;

type GroqJudgeJson = {
  winner_slot?: unknown;
  headline?: unknown;
  battle_description?: unknown;
};

@Injectable()
export class DuelResolverService {
  private readonly logger = new Logger(DuelResolverService.name);

  constructor(private readonly configService: ConfigService) {}

  async resolve(input: {
    firstInput: string;
    secondInput: string;
  }): Promise<MockDuelResolveResponse> {
    const inputA = input.firstInput.trim();
    const inputB = input.secondInput.trim();

    if (inputA.toLowerCase() === inputB.toLowerCase()) {
      return {
        winner_slot: 'tie',
        headline: 'EQUAL MATCH',
        battle_description: `${inputA} clashes with another ${inputB} in a perfect deadlock.`,
      };
    }

    try {
      return await this.resolveWithGroq(inputA, inputB);
    } catch (error: unknown) {
      this.logger.warn(
        `Groq judge failed — using template fallback: ${String(error)}`,
      );
      return this.fallbackResolve(inputA, inputB);
    }
  }

  private async resolveWithGroq(
    inputA: string,
    inputB: string,
  ): Promise<MockDuelResolveResponse> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    try {
      const response = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: [
                'You are an impartial, witty Rock-Paper-Scissors-Anything game judge.',
                'Decide which concept wins a duel between two player throws.',
                'Judging criteria (in order):',
                '1) Direct Counter — Does concept A explicitly counter/neutralize concept B (or vice versa)?',
                '2) Power & Scale — If no direct counter, which has greater magnitude or physical/conceptual power?',
                '3) Creative Logic — If both are abstract/weird, choose the funnier, more clever interaction.',
                'Respond with ONLY valid JSON matching this schema:',
                '{"winner_slot":"first"|"second"|"tie","headline":"SHORT UPPERCASE PUNCHLINE","battle_description":"A witty hilarious 1-2 sentence explanation."}',
                'winner_slot "first" means the first concept wins; "second" means the second concept wins.',
                'headline must be short and UPPERCASE (e.g. "LION OUTMUNCHES TIGER").',
                'battle_description must be witty and hilarious, 1-2 sentences.',
              ].join('\n'),
            },
            {
              role: 'user',
              content: JSON.stringify({
                first: inputA,
                second: inputB,
              }),
            },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Groq HTTP ${response.status}: ${body.slice(0, 200)}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq response missing message content');
      }

      return this.parseJudgeJson(content, inputA, inputB);
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseJudgeJson(
    content: string,
    inputA: string,
    inputB: string,
  ): MockDuelResolveResponse {
    let parsed: GroqJudgeJson;
    try {
      parsed = JSON.parse(content) as GroqJudgeJson;
    } catch {
      throw new Error('Groq returned non-JSON content');
    }

    const winnerSlot = parsed.winner_slot;
    if (
      winnerSlot !== 'first' &&
      winnerSlot !== 'second' &&
      winnerSlot !== 'tie'
    ) {
      throw new Error(`Invalid winner_slot: ${String(winnerSlot)}`);
    }

    const headline =
      typeof parsed.headline === 'string' && parsed.headline.trim()
        ? parsed.headline.trim().toUpperCase().slice(0, 80)
        : this.defaultHeadline(winnerSlot, inputA, inputB);

    const battleDescription =
      typeof parsed.battle_description === 'string' &&
      parsed.battle_description.trim()
        ? parsed.battle_description.trim().slice(0, 500)
        : this.defaultDescription(winnerSlot, inputA, inputB);

    return {
      winner_slot: winnerSlot,
      headline,
      battle_description: battleDescription,
    };
  }

  /** Legacy coin-flip template used when Groq is unavailable. */
  private fallbackResolve(
    inputA: string,
    inputB: string,
  ): MockDuelResolveResponse {
    const winnerSlot: 'first' | 'second' =
      Math.random() < 0.5 ? 'first' : 'second';
    const winnerInput = winnerSlot === 'first' ? inputA : inputB;
    const loserInput = winnerSlot === 'first' ? inputB : inputA;

    return {
      winner_slot: winnerSlot,
      headline: `${winnerInput.toUpperCase()} GETS PAST ${loserInput.toUpperCase()}`,
      battle_description: `${winnerInput} gets past ${loserInput}.`,
    };
  }

  private defaultHeadline(
    winnerSlot: 'first' | 'second' | 'tie',
    inputA: string,
    inputB: string,
  ): string {
    if (winnerSlot === 'tie') {
      return 'EQUAL MATCH';
    }
    const winner = winnerSlot === 'first' ? inputA : inputB;
    const loser = winnerSlot === 'first' ? inputB : inputA;
    return `${winner.toUpperCase()} BEATS ${loser.toUpperCase()}`;
  }

  private defaultDescription(
    winnerSlot: 'first' | 'second' | 'tie',
    inputA: string,
    inputB: string,
  ): string {
    if (winnerSlot === 'tie') {
      return `${inputA} clashes with another ${inputB} in a perfect deadlock.`;
    }
    const winner = winnerSlot === 'first' ? inputA : inputB;
    const loser = winnerSlot === 'first' ? inputB : inputA;
    return `${winner} gets past ${loser}.`;
  }
}
