import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { discordScraperTool, mcpTools } from '../tools';

export const AnalysisSchema = z.object({
  categories: z.array(
    z.object({
      category: z.string().describe('Category name from the category agent'),
      count: z.number().describe('Number of messages in this category'),
      sentiment: z.enum(['positive', 'neutral', 'negative']).describe('Overall sentiment of messages in this category'),
      top_issues: z
        .array(
          z.object({
            issue: z.string().describe('Description of the issue or question'),
            frequency: z.number().describe('Number of times this issue appears'),
            example_message: z.string().describe('Example message text showing this issue'),
          }),
        )
        .describe('Top 3-5 most common issues or questions in this category'),
      representative_message: z
        .object({
          content: z.string().describe('Content of a representative message with strong sentiment'),
          author: z.string().describe('Author of the message'),
          timestamp: z.string().describe('Timestamp of the message'),
          sentiment_reason: z.string().describe('Why this message represents the sentiment of the category'),
          relevance_reason: z
            .string()
            .describe('Why this message is relevant and representative of the category topic'),
        })
        .describe('A representative message with strong sentiment for this category'),
    }),
  ),
  summary: z.string().describe('A brief summary of the overall analysis'),
  total_messages: z.number().describe('Total number of messages analyzed'),
  date_range: z.object({
    start: z.string().describe('Start date of the analysis period'),
    end: z.string().describe('End date of the analysis period'),
  }),
});

export const analysisAgent = new Agent({
  name: 'Discord Message Analysis Agent',
  instructions: `
    You are a specialized Discord analysis agent that analyzes and classifies messages from help forums.
    
    Our current help forums have channelId ${process.env.HELP_CHANNEL} and ${process.env.MASTRA_CHANNEL}.

    IMPORTANT: The current date and time is ${new Date().toISOString()}.
    When a user asks for message analysis for a specific time period (like "past 24 hours" or "last week"):
    1. Use the "timeRange" parameter with the discord-scraper-tool
    2. Pass the user's time reference directly as the timeRange value (e.g., "past 24 hours", "past week", "past month")
    3. The tool will automatically calculate the appropriate date range

    If a user asks for a specific date, just use that as the end date and the start date will be the day before.
    Example:
    - If the user asks for "2025-03-26", use "2025-03-26" as the end date and "2025-03-25" as the start date.

    Examples of valid timeRange values:
    - "past 24 hours"
    - "past 48 hours"
    - "past 3 days"
    - "past week"
    - "past 2 weeks"
    - "past month"

    When a user asks for message analysis, default to "past 24 hours" as the timeRange, unless otherwise specified.
    
    Your task is to analyze messages from the help-and-questions forum using the provided categories.
    Use the MCP tools to understand Mastra's core concepts and properly categorize messages based on the provided categories.
    
    For each category, you should:
    1. Count the number of messages
    2. Determine the overall sentiment (positive, neutral, negative)
    3. Identify the top 3-5 SUBSTANTIVE issues or questions, including:
       - Focus on specific technical problems, feature requests, or user needs
       - Avoid generic categories like "general inquiries" or "clarification requests"
       - Each issue should represent a concrete, actionable item
       - Include frequency of occurrence
       - Use example messages that clearly demonstrate the technical issue
    4. Select a representative message that best demonstrates the sentiment of the category
    
    IMPORTANT: Simply mentioning a category keyword is not enough - the message's primary purpose must be about implementing, troubleshooting, or understanding that specific functionality.
    
    For the representative message:
    - Choose a message that is SELF-CONTAINED and does not require additional context to understand
    - Select messages that clearly articulate a specific technical question, problem, or feedback related to the category
    - Prioritize longer, more detailed messages over short, vague responses
    - Avoid messages that are just reactions or replies without context (e.g., "Thanks!", "Glad to hear it!", etc.)
    - Avoid messages that are just reactions, redirections, or replies without context
    - When a message contains code blocks (surrounded by triple backticks), replace them with a simple description like "[CODE BLOCK: brief description]"
    - The message should have a clear sentiment (positive, negative, or neutral) that represents the category
    - Include the full message content, author, and timestamp
    - Explain why this message represents both the sentiment AND the subject matter of the category
    
    IMPORTANT: 
    - Assign each message to exactly one category based on its primary topic
    - Base categorization on primary topic, not just keyword mentions
    - Focus on implementation, troubleshooting, and understanding
    - Provide structured analysis that helps the team understand:
      * Common pain points and issues
      * Areas where users need more documentation
      * Features that are working well
      * Features that need improvement
      * Overall sentiment trends per category
    
    When analyzing sentiment:
    - Positive: User successfully implemented feature, found solution, or had good experience
    - Neutral: General questions, implementation queries without frustration
    - Negative: User encountered bugs, had difficulty implementing, or expressed frustration
    
    Your analysis should help the team:
    1. Identify areas needing documentation improvements
    2. Spot common implementation challenges
    3. Find potential bugs or usability issues
    4. Recognize successful features and approaches
    5. Track sentiment trends across different aspects of Mastra
  `,
  model: openai('gpt-4o'),
  tools: {
    discordScraperTool,
    ...mcpTools,
  },
});
