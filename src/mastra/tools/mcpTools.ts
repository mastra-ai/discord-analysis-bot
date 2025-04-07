import { MCPConfiguration } from '@mastra/mcp';

console.log('Initializing MCP config...');

const mcpConfig = new MCPConfiguration({
  servers: {
    mastra: {
      command: 'npx',
      args: ['-y', '@mastra/mcp-docs-server@latest'],
    },
  },
});

let mcpTools: Record<string, any> = {};

try {
  const tools = await mcpConfig.getTools();
  console.log('MCP tools initialized successfully:', Object.keys(tools));
  mcpTools = tools;
} catch (error) {
  console.error('Failed to initialize MCP tools:', error);
  throw error;
}

export { mcpTools };
