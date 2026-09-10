import { streamText } from 'ai';
import { engineeringPrompt, generalPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, mode } = await req.json();

  const result = streamText({
    model: 'openai/gpt-5.6-sol',
    system: mode === 'engineering' ? engineeringPrompt : generalPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
