import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { mcpTools } from '../tools';

export const CategorySchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().describe('Category name based on Mastra core concepts'),
      description: z.string().describe('Description of what this category encompasses'),
      keywords: z.array(z.string()).describe('Key terms and concepts that belong in this category'),
    }),
  ),
});

export const categoryAgent = new Agent({
  name: 'Category Definition Agent',
  instructions: `
    You are a specialized agent that defines categories for Discord message analysis based on Mastra's documentation.
    
    Your task is to:
    1. Use the MCP tools to explore Mastra's documentation
    2. Create a list of relevant categories based on core concepts
    3. For each category:
       - Define a clear, concise name that reflects the core concept
       - Provide a description that explains what types of questions/issues belong in this category
       - List key terms and concepts that help identify messages belonging to this category

    IMPORTANT: Categories should be:
    - Focused on major functional areas
    - Mutually exclusive when possible
    - Based on actual documentation content
    - Relevant to user questions and issues

    These are some of the example categories we want to have included. Please add more on top of this: 
    - Workflows
    - Memory
    - Documentation
    - Getting Started
    
    Include an "Other" category for messages that don't fit elsewhere.
  `,
  model: openai('gpt-4o'),
  tools: mcpTools,
});
