import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key' });

  const client = new Anthropic({ apiKey });

  // Try 3 approaches to find what works for web search
  const approaches = [
    // Approach A: No beta header at all (web search may be GA)
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (client.messages.create as any)({
        model: 'claude-sonnet-4-5',
        max_tokens: 200,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 1 }],
        messages: [{ role: 'user', content: 'Visit razorpay.com and tell me in 1 sentence what Razorpay does.' }],
      });
    },
    // Approach B: search_20250422 tool type
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (client.messages.create as any)({
        model: 'claude-sonnet-4-5',
        max_tokens: 200,
        tools: [{ type: 'web_search_20250422', name: 'web_search', max_uses: 1 }],
        messages: [{ role: 'user', content: 'Visit razorpay.com and tell me in 1 sentence what Razorpay does.' }],
      });
    },
  ];

  const names = ['no-beta', 'new-tool-type'];
  const results: Record<string, string> = {};

  for (let i = 0; i < approaches.length; i++) {
    try {
      const res = await approaches[i]();
      let text = '';
      for (const block of res.content) {
        if (block.type === 'text') text = block.text;
      }
      results[names[i]] = `WORKS ✓ stop_reason:${res.stop_reason} — ${text.slice(0, 100)}`;
      break; // stop at first working approach
    } catch (e: unknown) {
      const err = e as { message?: string };
      results[names[i]] = `FAILED: ${err.message?.slice(0, 120)}`;
    }
  }

  return NextResponse.json({ model: 'claude-sonnet-4-5', results });
}
