# Devcontainer setup for controlled deposit/withdraw/ticks

## Services

- **app** – Your dev container (sleep infinity); runs treasury-api / treasury-monitor from `/workspaces`.
- **mysql** – MySQL 8.0. Root: `root` / `rootpassword`. Port **3312** on host → 3306 in container.
  - Databases created on first run (when MySQL data is empty): `treasury_dev`, `db_app_dev`, `treasury_gcoti_rewards`.
  - If you already had a volume with data, run once:  
    `mysql -h mysql -u root -prootpassword -e "CREATE DATABASE IF NOT EXISTS treasury_dev; CREATE DATABASE IF NOT EXISTS db_app_dev; CREATE DATABASE IF NOT EXISTS treasury_gcoti_rewards;"`
- **redis** – Redis 7. Port 6379. Used by treasury-api (REDIS_IP=redis).
- **mock-chain** – HTTP server that mocks chain API so ticks can run without a real chain. Port **3110**.

## Env files

- **.env-api** and **.env-monitor** are set to use:
  - **DB_HOST=mysql**, **DB_PORT=3306**, **DB_SYNC_HOST=mysql**, same for snapshot DBs.
  - **REDIS_IP=redis** (in .env-api).
  - **DB_APP_URL=http://mock-chain:3110/get-sync-state** (in .env-monitor) so the tick’s “is DB synced?” check gets a mock response.

When running **outside** the devcontainer (e.g. API on host), set **DB_HOST=localhost**, **DB_PORT=3312**, **REDIS_IP=localhost** (and ensure Redis is on 6379).

## Mock chain API (custom outputs)

The monitor calls `DB_APP_URL` (e.g. `http://mock-chain:3110/get-sync-state`). The response must have `data.syncPercentage >= 95` or the tick stops.

To **provide your own outputs**:

1. Edit **`.devcontainer/mock-responses.json`**.
2. Keys are URL path segments (no leading slash). The server serves `GET /<key>` with the JSON value for that key.
3. Example:  
   `"get-sync-state": { "data": { "syncPercentage": 100 } }`  
   Add more keys for any other chain/API endpoints you want to mock; then point the app’s env (e.g. FULL_NODE, COTI_PRICE_SERVICE_URL) to `http://mock-chain:3110/<key>` if needed.
4. Restart the **mock-chain** service (or rebuild) so it reloads the file.

The mock server is **.devcontainer/mock-chain-server.js** (Node, no extra deps). Run manually:  
`node .devcontainer/mock-chain-server.js --port=3110 --responses=.devcontainer/mock-responses.json`

## Running API and monitor in the devcontainer

1. Open project in devcontainer (MySQL, Redis, mock-chain start automatically).
2. Create DBs if needed (see above).
3. Add **SYNC_SCHEMA=true** to `.env-api` and `.env-monitor` so tables are created on first run (or run your usual migrations).
4. Start API: `npm run start-treasury-api:dev` (use `.env-api`).
5. Start monitor: `npm run start-treasury-monitor:dev` (use `.env-monitor`).

Ticks will run on the cron schedule; `DB_APP_URL` is satisfied by the mock so the “db sync” check passes. For full control, seed `db_app_dev` with the transaction data you want the monitor to see (e.g. from your own fixture or script).

## npm install (node-hid / libusb)

The project depends on `@coti-io/crypto`, which pulls in `node-hid` (Ledger USB). Building `node-hid` requires **libusb**. The devcontainer Dockerfile includes `libusb-1.0-0-dev` so `npm i` succeeds after a rebuild.

If you see `libusb.h` or `libudev.h: No such file or directory` or `node-hid` build failures in an existing container, install libusb and libudev dev packages and re-run install:

```bash
sudo apt-get update && sudo apt-get install -y libusb-1.0-0-dev libudev-dev && npm i
```

Then rebuild the devcontainer (or use a new one) so future installs have libusb by default.
