/**
 * Checks the workflow against the published RoxyAPI n8n node, so a renamed operation or field
 * fails here instead of in the n8n of a user.
 *
 * Run:    npm install --no-save --legacy-peer-deps @roxyapi/n8n-nodes-roxyapi n8n-workflow && node scripts/check.mjs
 * Does:   parses ai-astrology-chatbot.json, refuses stored credentials or keys, and confirms every
 *         RoxyAPI node and tool names a resource, operation and field that the installed node defines.
 * Writes: nothing; exits non-zero on the first class of problem it finds.
 * Pairs:  .github/workflows/ci.yml runs it on every push and weekly against the latest node.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const workflow = JSON.parse(readFileSync(new URL('../ai-astrology-chatbot.json', import.meta.url), 'utf8'));
const { RoxyApi } = require('@roxyapi/n8n-nodes-roxyapi/dist/nodes/RoxyApi/RoxyApi.node.js');
const properties = new RoxyApi().description.properties;
const problems = [];

const raw = JSON.stringify(workflow);
if (workflow.nodes.some((node) => node.credentials)) problems.push('a node stores a credential reference');
if (/sk_[a-z0-9]|AIza|"apiKey"\s*:\s*"[^"]/i.test(raw)) problems.push('the file contains something shaped like a key');

/** The fields n8n shows for one operation: required parameters plus the Options collection. */
function fieldsOf(resource, operation) {
  const shown = properties.filter(
    (p) => p.displayOptions?.show?.resource?.includes(resource) && p.displayOptions?.show?.operation?.includes(operation),
  );
  return new Set(shown.flatMap((p) => (p.name === 'options' ? p.options.map((o) => o.name) : [p.name])));
}

const resourceDefault = properties.find((p) => p.name === 'resource').default;
const roxyTypes = new Set(['@roxyapi/n8n-nodes-roxyapi.roxyApi', '@roxyapi/n8n-nodes-roxyapi.roxyApiTool']);
for (const node of workflow.nodes.filter((n) => roxyTypes.has(n.type))) {
  const { resource = resourceDefault, operation, options = {}, ...rest } = node.parameters;
  const selector = properties.find((p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes(resource));
  if (!selector?.options.some((o) => o.value === operation)) {
    problems.push(`${node.name}: ${resource} has no operation ${operation}`);
    continue;
  }
  const fields = fieldsOf(resource, operation);
  const used = [...Object.keys(rest).filter((k) => k !== 'requestOptions'), ...Object.keys(options)];
  for (const field of used) if (!fields.has(field)) problems.push(`${node.name}: ${operation} has no field ${field}`);
}

if (problems.length) {
  console.error(`check: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`check: workflow matches @roxyapi/n8n-nodes-roxyapi ${require('@roxyapi/n8n-nodes-roxyapi/package.json').version}`);
