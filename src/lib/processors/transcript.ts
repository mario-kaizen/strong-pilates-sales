import Anthropic from '@anthropic-ai/sdk'
import type { DiagnosisResult } from './types'

const SYSTEM_PROMPT = `You are analysing a sales call transcript or notes from a business coach (Mario Paguio, Kaizen Collective) with a STRONG Pilates studio owner.

Extract the following from the transcript:
1. challenges: The problems the prospect described (their words/perspective). Be specific.
2. blindspots: What the coach identified that the prospect can't see. These are the strategic insights.
3. recommendations: What the coach prescribed as the solution. Include specific actions.
4. summary: A 2-3 sentence executive summary of the diagnosis.

Return ONLY valid JSON with no other text:
{"challenges": ["..."], "blindspots": ["..."], "recommendations": ["..."], "summary": "..."}`

export async function analyseTranscript(transcript: string): Promise<DiagnosisResult> {
  const client = new Anthropic()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: transcript,
      },
    ],
  })

  const rawText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const parsed = JSON.parse(rawText) as DiagnosisResult
    return parsed
  } catch {
    return {
      challenges: [],
      blindspots: [],
      recommendations: [],
      summary: rawText,
    }
  }
}
