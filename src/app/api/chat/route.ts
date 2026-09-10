import { streamText } from 'ai';
import { engineeringPrompt, generalPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, mode } = await req.json();
  const model = process.env.AI_MODEL;

  if (!model) {
    return new Response('AI_MODEL is not configured', { status: 500 });
  }

  const result = streamText({
    model,
    system: mode === 'engineering' ? engineeringPrompt : generalPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
