# AGENTS.md

An n8n workflow template: an AI astrology companion whose chart, horoscope and tarot facts come from RoxyAPI tool calls. The whole template is one file, `astrology-ai-agent.json`, imported into n8n.

## RoxyAPI references

| Need | Source |
|---|---|
| Every operation, field and response | https://roxyapi.com/api/v2/openapi.json |
| Docs an agent can search | Remote MCP https://roxyapi.com/mcp/docs, https://roxyapi.com/AGENTS.md, https://roxyapi.com/llms.txt |
| The n8n node and its operations | https://www.npmjs.com/package/@roxyapi/n8n-nodes-roxyapi |
| The n8n guide | https://roxyapi.com/docs/integrations/n8n |

## Where to change what

| To change | Edit |
|---|---|
| The voice, the rules, what it asks for | `options.systemMessage` on the **Astrology AI Agent** node |
| Which calculations it can run | Add or remove `@roxyapi/n8n-nodes-roxyapi.roxyApiTool` nodes connected to the agent `ai_tool` input |
| What the model passes to a tool | The `$fromAI('key', 'description', 'type')` expressions in that tool's parameters |
| The chat page title, greeting and placeholder | The **When chat message received** node |
| How much it remembers | `contextWindowLength` on **Conversation memory** |

## Conventions

- Never store a credential or key in the file; n8n asks for credentials on import.
- A RoxyAPI tool parameter name must exist on that operation in the node. `node scripts/check.mjs` (after `npm install --no-save --legacy-peer-deps @roxyapi/n8n-nodes-roxyapi n8n-workflow`) verifies every tool against the published node.
- Resolve the city with Search Cities before any chart operation; never ask a person for coordinates.
