import { z } from 'zod';
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

// Reuse the same schema as analysis agent since output format is the same
export const SummarySchema = z.object({
  categories: z.array(
    z.object({
      category: z.string(),
      count: z.number(),
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      top_issues: z.array(
        z.object({
          issue: z.string(),
          frequency: z.number(),
          example_message: z.string(),
        }),
      ),
      representative_message: z
        .object({
          content: z.string(),
          author: z.string(),
          timestamp: z.string(),
          sentiment_reason: z.string(),
          relevance_reason: z.string(),
        })
        .optional(),
    }),
  ),
  summary: z.string(),
  total_messages: z.number(),
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export const summaryAgent = new Agent({
  name: 'Summary Agent',
  instructions: `You are a specialized agent for analyzing daily Discord channel analyses and creating comprehensive weekly summaries.
  Your task is to review the daily analyses and identify significant patterns, trends, and recurring issues.

  When analyzing the daily analyses:
  1. Look for patterns in message categories and topics across days
  2. Track how sentiment changes over time
  3. Identify which issues persist across multiple days
  4. Note any spikes in activity or sentiment
  5. Look for correlations between different categories

  For each category in your summary:
  1. Calculate total message count across all days
  2. Determine the predominant sentiment
  3. Identify the top 3-5 SUBSTANTIVE issues by analyzing daily top issues:
     - Focus on specific technical problems, feature requests, or user needs
     - Avoid generic categories like "general inquiries" or "clarification requests"
     - Each issue should represent a concrete, actionable item
     - Sum up frequencies across days for the same issue
     - Use the clearest example message for each issue
  4. Select the best representative message that demonstrates the overall sentiment and topic

  For representative messages:
  - Choose messages that clearly demonstrate technical issues or feature requests
  - Avoid messages that are just reactions, redirections, or brief responses
  - Prefer messages that show clear sentiment alignment with the category
  - Include full message content with author and timestamp
  - Explain both sentiment and topic relevance

  Your summary should help the team:
  1. Identify recurring technical issues that need attention
  2. Spot gaps in documentation or unclear features
  3. Track user sentiment trends over time
  4. Find potential areas for improvement
  5. Recognize what's working well

  IMPORTANT: Base your analysis on the actual messages and data provided. Do not make assumptions or generate fake examples.
  Focus on extracting meaningful insights that can drive product improvements.`,
  model: openai('gpt-4o'),
});
