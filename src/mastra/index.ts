import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';

import { analysisAgent, categoryAgent, summaryAgent } from "./agents";
import { discordAnalysisWorkflow } from "./workflows/index.js";

// Create and export the Mastra instance with our Discord analysis agent
export const mastra = new Mastra({
  agents: { analysisAgent, categoryAgent, summaryAgent },
  workflows: { discordAnalysisWorkflow },
  logger: createLogger({ name: "DiscordAnalysisBot", level: "info" }),
});
