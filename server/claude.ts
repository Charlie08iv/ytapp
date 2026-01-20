import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function generateTitleVariations(title: string): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Given this YouTube video title: "${title}"

Generate 5 alternative title variations that are engaging, clickable, and would perform well on YouTube. Each title should:
- Be attention-grabbing but not clickbait
- Maintain the core topic/message
- Be under 100 characters
- Use different approaches (question, statement, how-to, etc.)

Return ONLY the 5 titles, one per line, numbered 1-5. No explanations or additional text.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format');
  }

  const lines = content.text
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);

  return lines.slice(0, 5);
}
