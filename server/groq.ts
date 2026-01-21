import Groq from 'groq-sdk';

export async function generateTitleVariations(title: string): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const groq = new Groq({ apiKey });

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
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
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content || '';

  const lines = text
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);

  return lines.slice(0, 5);
}
