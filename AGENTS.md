# AGENTS.md

An n8n workflow template: a multi-agent AI astrology reader for web chat and Telegram. A reader agent delegates to specialist agents (Western, Vedic, numerology, tarot and I Ching, Human Design, Chinese BaZi) whose chart, number and card facts come from RoxyAPI tool calls, saves birth profiles to an n8n Data Table, and sends Telegram subscribers a daily forecast. The whole template is one file, `ai-astrology-chatbot.json`, imported into n8n.

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
| The AI provider | `aiProvider` on **Workflow settings**; the matching rule on **Model selector** |
| How the reader routes, its voice and its rules | `options.systemMessage` on **AI astrology reader** |
| What a specialist does | Its `toolDescription` (when the reader calls it) and `options.systemMessage` |
| Which calculations a specialist can run | Add or remove `@roxyapi/n8n-nodes-roxyapi.roxyApiTool` nodes on that specialist `ai_tool` input |
| What the model passes to a tool | The `$fromAI('key', 'description', 'type')` expressions in the parameters of that tool |
| The saved profile columns | **Create the profile table**, **Save birth profile** and the reader system message, together |
| The morning message | **Every morning at 7**, **Check for sky alerts** and the prompt on **Write the daily forecast** |
| The chat page title, greeting and placeholder | **When chat message received** |

## Conventions

- Never store a credential or key in the file; n8n asks for credentials on import.
- A RoxyAPI parameter name must exist on that operation in the node. `node scripts/check.mjs` (after `npm install --no-save --legacy-peer-deps @roxyapi/n8n-nodes-roxyapi n8n-workflow`) verifies every RoxyAPI node and tool against the published node.
- Resolve the city with Search Cities before any chart operation; never ask a person for coordinates.
- Specialists see only the message the reader sends them, so that message carries every birth detail they need.
- Nodes inside a tool or a model read workflow data with `$('Node name').first()`.
