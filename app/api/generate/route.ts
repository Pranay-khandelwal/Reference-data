import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CompanyGroup } from '@/lib/types';

const SYSTEM_PROMPT = `You draft cold outreach emails for Pranay from Xpertiz following his strict personal SOP. Your only creative task is writing Para 2. Every other paragraph is fixed and must be reproduced verbatim.

FIXED BLOCKS — reproduce these exactly, no changes allowed:

SUBJECT LINE FORMAT: "Strategic interest in [Company Name]"
Never add anything else to the subject line.

PARA 1 — identical in every email:
I'm Pranay from Xpertiz, an investment banking advisory firm working with technology companies on M&A, strategic transactions, and capital partnerships. We've advised technology leaders such as Infosys and Accenture and have recently closed two transactions in the cybersecurity and semiconductor sectors.

PARA 3 — fill [SECTOR] and [COMPANY NAME] only:
We're currently advising a strategic investor active in [SECTOR], and [COMPANY NAME] surfaced naturally in that work.

PARA 4 — identical in every email:
If a short call is useful, happy to connect. If someone from your strategy side is better placed, I'd appreciate a direction.

SIGN-OFF — identical in every email:
For your reference, I've attached our company profile.

YOUR ONLY TASK: WRITE PARA 2

Para 2 is exactly 2 sentences. Role-specific. No more, no less.

Sentence 1 — industry observation with contrast. Must open with one of:
"We've been spending time looking at..."
"In [sector], the..."
"One pattern we keep seeing..."

Sentence 2 — company lands. Names ONE or TWO specific things from the website (named product, named platform, named capability). Never opens with the company name. Closes with one of these exact phrases:
"is what brought you into our current conversations"
"surfaced for us"
"came up for us"
"stood out while we were looking at this space"

ROLE ANGLES:
CEO: business model evolution, strategic arc, market position
CTO: technical architecture, the hardest engineering bet, specific technical problem solved — use named platforms and tools
COO: operational friction, day-to-day problem the role personally owns, gap between signal and action

PARA 2 HARD RULES:
- Exactly 2 sentences
- No dashes of any kind (em, en, hyphen in clauses)
- Contractions mandatory (We've, We're, I'd, It's)
- No superlatives, no flattery, no investor language
- Reads in one breath — if you need a pause, it's too long
- Sentence 2 never opens with the company name
- Never list more than 2 named items
- Do not teach the founder their own business

BANNED PHRASES (rewrite if any appear):
"integrated positioning" / "economic profile" / "margin pressure" / "exactly the kind of" / "deep platform expertise" / "productized innovation" / "compounding integration depth" / "value proposition" / "synergy" / "disruptive" / "innovative" / "would love to" / "just wanted to" / "clear validation" / "AI-powered" / "end-to-end" / "holistic" / "robust" / "leading provider" / "best-in-class"

RESEARCH RULE:
Use web search to visit the company's official website only. Extract named products, platforms, proprietary tools, architecture signals, and business model evolution. Do not use funding news, Crunchbase, press releases, or third-party sources.

OUTPUT: Return only a valid JSON object. No markdown. No preamble. No explanation outside the JSON. Schema:
{
  "sector": "2-3 word sector label",
  "company_summary": "2 plain sentences from website research",
  "hook_confidence": "HIGH | MEDIUM | LOW | NOT_FOUND",
  "emails": [
    {
      "role": "CEO",
      "contact_name": "Full Name",
      "contact_email": "email@company.com",
      "subject": "Strategic interest in CompanyName",
      "para2": "2-sentence Para 2 only",
      "full_email": "Hi FirstName,\\n\\n[Para1 verbatim]\\n\\n[Para2]\\n\\n[Para3]\\n\\nIf a short call is useful, happy to connect. If someone from your strategy side is better placed, I'd appreciate a direction.\\n\\nFor your reference, I've attached our company profile."
    }
  ]
}`;

function buildUserMessage(group: CompanyGroup): string {
  const contactsText = group.contacts
    .map(c => `- ${c.name} (${c.role}) — ${c.email}`)
    .join('\n');

  return `Company: ${group.companyName}
Website: ${group.websiteUrl || 'Not provided'}
LinkedIn: ${group.linkedinUrl || 'Not provided'}

Contacts:
${contactsText}

Please research the company website and generate personalised cold emails for each contact listed above. Return valid JSON only.`;
}

function extractJsonFromText(text: string): string {
  // Find the first { and last } to extract the JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No JSON object found in response');
  }
  return text.slice(firstBrace, lastBrace + 1);
}

export async function POST(req: NextRequest) {
  try {
    const group: CompanyGroup = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userMessage = buildUserMessage(group);

    // Web search is now GA — no beta header needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.messages.create as any)({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        },
      ],
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract the last text block from the response content
    let lastTextBlock = '';
    if (response.content && Array.isArray(response.content)) {
      for (const block of response.content) {
        if (block.type === 'text' && block.text) {
          lastTextBlock = block.text;
        }
      }
    }

    if (!lastTextBlock) {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 500 }
      );
    }

    const jsonStr = extractJsonFromText(lastTextBlock);
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('API generate error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
