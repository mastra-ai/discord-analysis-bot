import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';

import { discordAnalysisAgent } from './agents/index.js';
import { analysisAgent } from './agents/analysis-agent.js';
import { categoryAgent } from './agents/category-agent.js';
import { summaryAgent } from './agents/summary-agent.js';
import { discordAnalysisWorkflow } from './workflows/index.js';

// Create and export the Mastra instance with our Discord analysis agent
export const mastra = new Mastra({
  agents: { discordAnalysisAgent, analysisAgent, categoryAgent, summaryAgent },
  workflows: { discordAnalysisWorkflow },
  logger: createLogger({ name: 'DiscordAnalysisBot', level: 'info' }),
});
