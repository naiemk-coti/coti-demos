#!/usr/bin/env node
/**
 * Mock chain API server for devcontainer.
 * Serves configurable JSON responses so deposit/withdraw/ticks can run without real chain.
 *
 * Usage: node mock-chain-server.js [--port=3110] [--responses=./mock-responses.json]
 *
 * Responses file: JSON object keyed by path (without leading slash).
 * Example: { "get-sync-state": { "data": { "syncPercentage": 100 } } }
 * Request GET /get-sync-state returns that object.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 3110;
const DEFAULT_RESPONSES_PATH = path.join(__dirname, 'mock-responses.json');

const args = process.argv.slice(2);
let port = DEFAULT_PORT;
let responsesPath = DEFAULT_RESPONSES_PATH;
args.forEach(arg => {
  if (arg.startsWith('--port=')) port = parseInt(arg.slice(7), 10) || DEFAULT_PORT;
  if (arg.startsWith('--responses=')) responsesPath = arg.slice(12);
});

function loadResponses() {
  try {
    const raw = fs.readFileSync(responsesPath, 'utf8');
    const obj = JSON.parse(raw);
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!key.startsWith('_')) out[key] = value;
    }
    return out;
  } catch (e) {
    console.error('Failed to load', responsesPath, e.message);
    return {
      'get-sync-state': { data: { syncPercentage: 100 } },
    };
  }
}

let responses = loadResponses();
const server = http.createServer((req, res) => {
  const pathname = req.url.split('?')[0].replace(/^\//, '') || 'get-sync-state';
  const payload = responses[pathname];
  if (payload !== undefined) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Mock chain server on port ${port}, responses from ${responsesPath}`);
});
