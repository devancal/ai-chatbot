import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { engineeringPrompt, generalPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();
    const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

    if (!apiKey) {
      return new Response(
        'AI Gateway authentication is missing. Add AI_GATEWAY_API_KEY in Vercel project environment variables.',
        { status: 500 }
      );
    }

    const gateway = createOpenAICompatible({
      name: 'vercel-ai-gateway',
      apiKey,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    });

    const result = streamText({
      model: gateway('openai/gpt-5.6-sol'),
      system: mode === 'engineering' ? engineeringPrompt : generalPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat route failed:', error);
    return new Response(
      error instanceof Error ? error.message : 'Unknown chat error',
      { status: 500 }
    );
  }
}
