import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';

import { categoryAgent, CategorySchema } from '../agents/category-agent.js';
import { analysisAgent, AnalysisSchema } from '../agents/analysis-agent.js';

const defineCategories = new Step({
  id: 'defineCategories',
  execute: async ({ context }) => {
    return await categoryAgent.generate('Define categories based on Mastra documentation');
  },
});

const analyzeMessages = new Step({
  id: 'analyzeMessages',
  execute: async ({ context }) => {
    if (context?.steps.parseDates.status !== 'success' || context?.steps.defineCategories.status !== 'success') {
      throw new Error('Previous steps failed');
    }
    const dateRange = context.steps.parseDates.output.dates;
    const categories = context.steps.defineCategories.output.categories;
    return await analysisAgent.generate(
      `Analyze messages from ${dateRange.start} to ${dateRange.end} using categories: ${categories.map(c => c.name).join(', ')}`,
    );
  },
});

// Create the workflow
export const discordAnalysisWorkflow = new Workflow({
  name: 'discord-analysis',
  triggerSchema: z.object({
    timeRange: z.string().optional(),
    specificDate: z.string().optional(),
  }),
});

// Chain the steps
discordAnalysisWorkflow.step(defineCategories).then(analyzeMessages).commit();
