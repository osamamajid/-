const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const { PrismaClient } = require('@prisma/client');

const backendRoot = path.resolve(__dirname, '..');
const prismaDir = path.join(backendRoot, 'prisma');
const sourceDb = path.join(prismaDir, 'dev.db');
const preparedDb = path.join(prismaDir, 'load-test-base.db');
const stageDb = path.join(prismaDir, 'load-test.db');
const resultsPath = path.join(backendRoot, 'sqlite-load-test-results.json');
const port = 5100;
const baseUrl = `http://127.0.0.1:${port}/api`;
const durationMs = 10_000;
const levels = [1, 10, 50, 100, 200, 500];

const percentile = (values, value) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((value / 100) * sorted.length) - 1)];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const copyDatabase = (source, destination) => {
  fs.copyFileSync(source, destination);
};

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('Load-test backend did not become healthy');
};

const startServer = () => {
  const tsxPath = path.join(backendRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const server = spawn(process.execPath, [tsxPath, 'src/app.ts'], {
    cwd: backendRoot,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      LOAD_TEST: 'true',
      PORT: String(port),
      DATABASE_URL: 'file:./load-test.db',
      CORS_ORIGIN: 'http://127.0.0.1:5173',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  server.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  server.stdout.on('data', () => {});
  return { server, getStderr: () => stderr };
};

const stopServer = async (server) => {
  if (!server || server.exitCode !== null) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
  await Promise.race([
    new Promise((resolve) => server.once('close', resolve)),
    sleep(1_000),
  ]);
};

const apiRequest = async (method, url, token, body, workerId) => {
  const started = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const requestUrl = workerId > 0
    ? url.replace('127.0.0.1', `127.0.0.${2 + (workerId % 200)}`)
    : url;
  try {
    const response = await fetch(requestUrl, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Load-Test-Worker': String(workerId),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, latency: performance.now() - started, text };
  } catch (error) {
    return { status: 0, latency: performance.now() - started, text: String(error) };
  } finally {
    clearTimeout(timeout);
  }
};

const classify = (result, metrics) => {
  metrics.requests += 1;
  metrics.latencies.push(result.latency);
  if (result.status >= 200 && result.status < 300) metrics.success += 1;
  else metrics.failed += 1;
  if (result.status >= 200 && result.status < 300) metrics.status2xx += 1;
  else if (result.status >= 400 && result.status < 500) metrics.status4xx += 1;
  else if (result.status >= 500) metrics.status5xx += 1;
  if (result.status === 429) metrics.rateLimited += 1;
  if (result.status === 0) metrics.connectionErrors += 1;
  if (result.text.includes('timeout') || result.text.includes('AbortError')) metrics.timeouts += 1;
  if (/SQLITE_BUSY|database is busy/i.test(result.text)) metrics.sqliteBusy += 1;
  if (/SQLITE_LOCKED|database is locked/i.test(result.text)) metrics.sqliteLocked += 1;
  if (/transaction|deadlock|partial/i.test(result.text)) metrics.transactionFailures += 1;
  if (result.status < 200 || result.status >= 300) {
    if (metrics.errorSamples.length < 5) metrics.errorSamples.push({ status: result.status, text: result.text.slice(0, 300) });
  }
};

const getJson = async (url, token) => {
  const response = await apiRequest('GET', url, token, undefined, 0);
  if (response.status !== 200) throw new Error(`GET ${url} failed with ${response.status}: ${response.text}`);
  return JSON.parse(response.text);
};

const buildDynamicValues = (fields, workerId, sequence) => {
  const values = {};
  for (const field of fields || []) {
    if (field.fieldType === 'NUMBER') values[field.fieldKey] = 2024 + (sequence % 3);
    else if (field.fieldType === 'SELECT') values[field.fieldKey] = (field.options || [])[0];
    else if (field.fieldType === 'CHECKBOX') values[field.fieldKey] = false;
    else if (field.fieldType === 'DATE') values[field.fieldKey] = '2026-09-15';
    else if (/name|اسم|مشتري|بائع|موظف|مؤجر|مستأجر|مقدم|متلقي/i.test(`${field.fieldKey} ${field.label}`)) values[field.fieldKey] = `Load User ${workerId}`;
    else if (field.fieldKey.includes('id')) values[field.fieldKey] = `900${workerId}${sequence}`.slice(0, 12);
    else if (field.fieldKey.includes('plate')) values[field.fieldKey] = `أ ب ${workerId % 99} ${sequence % 9999}`;
    else values[field.fieldKey] = `Load test value ${workerId}-${sequence}`;
  }
  return values;
};

const createCustomerBody = (workerId, sequence) => ({
  fullName: `Load Test Customer ${workerId}-${sequence}`,
  phone: `077${String(workerId).padStart(3, '0')}${String(sequence).padStart(4, '0')}`,
  nationalId: `L${workerId}${sequence}`,
  address: 'بغداد - عنوان اختبار الضغط',
  governorate: 'بغداد',
  notes: 'SQLite load test record',
});

const createContractBody = (type, customerId, workerId, sequence) => ({
  contractTypeId: type.id,
  customerId,
  startDate: '2026-09-15',
  endDate: null,
  status: 'DRAFT',
  totalAmount: 125000 + sequence,
  paymentMethod: 'CASH',
  notes: 'SQLite load test contract',
  values: buildDynamicValues(type.fields, workerId, sequence),
});

const makeMetrics = (level, scenario) => ({
  level,
  scenario,
  requests: 0,
  success: 0,
  failed: 0,
  status2xx: 0,
  status4xx: 0,
  status5xx: 0,
  connectionErrors: 0,
  timeouts: 0,
  sqliteBusy: 0,
  sqliteLocked: 0,
  transactionFailures: 0,
  rateLimited: 0,
  errorSamples: [],
  latencies: [],
});

const runScenario = async (level, scenario, token, type, customerId) => {
  const metrics = makeMetrics(level, scenario);
  const deadline = Date.now() + durationMs;
  let sequence = 0;
  const worker = async (workerId) => {
    while (Date.now() < deadline) {
      sequence += 1;
      const roll = (workerId + sequence) % 100;
      let result;
      if (scenario === 'read-heavy' || (scenario === 'balanced' && roll < 70)) {
        const paths = ['/dashboard/stats', '/customers?limit=20', '/contracts?limit=20', '/contract-types', '/reports/contracts'];
        result = await apiRequest('GET', `${baseUrl}${paths[workerId % paths.length]}`, token, undefined, workerId);
      } else if (scenario === 'balanced' || scenario === 'write-heavy') {
        if (roll % 2 === 0) {
          result = await apiRequest('POST', `${baseUrl}/customers`, token, createCustomerBody(workerId, sequence), workerId);
        } else {
          result = await apiRequest('POST', `${baseUrl}/contracts`, token, createContractBody(type, customerId, workerId, sequence), workerId);
        }
      }
      classify(result, metrics);
    }
  };
  await Promise.all(Array.from({ length: level }, (_, workerId) => worker(workerId + 1)));
  const { latencies, ...summary } = metrics;
  return {
    ...summary,
    rps: Number((metrics.requests / (durationMs / 1000)).toFixed(2)),
    averageMs: Number((latencies.reduce((sum, value) => sum + value, 0) / (latencies.length || 1)).toFixed(2)),
    minMs: Number((Math.min(...latencies, 0)).toFixed(2)),
    maxMs: Number((Math.max(...latencies, 0)).toFixed(2)),
    p50Ms: Number(percentile(latencies, 50).toFixed(2)),
    p90Ms: Number(percentile(latencies, 90).toFixed(2)),
    p95Ms: Number(percentile(latencies, 95).toFixed(2)),
    p99Ms: Number(percentile(latencies, 99).toFixed(2)),
    errorRate: Number(((metrics.failed / (metrics.requests || 1)) * 100).toFixed(2)),
  };
};

const databaseSnapshot = async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: 'file:./load-test.db' } } });
  const counts = {
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    contracts: await prisma.contract.count(),
    contractValues: await prisma.contractValue.count(),
    auditLogs: await prisma.auditLog.count(),
  };
  const pragmas = {};
  for (const name of ['journal_mode', 'synchronous', 'busy_timeout', 'foreign_keys']) {
    const rows = await prisma.$queryRawUnsafe(`PRAGMA ${name}`);
    pragmas[name] = rows;
  }
  await prisma.$disconnect();
  return { counts, pragmas, fileSize: fs.statSync(stageDb).size };
};

const prepareDataset = async () => {
  copyDatabase(sourceDb, preparedDb);
  const prisma = new PrismaClient({ datasources: { db: { url: 'file:./load-test-base.db' } } });
  const role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const type = await prisma.contractType.findFirst({ include: { templates: { where: { isDefault: true }, include: { fields: true } } } });
  const customer = await prisma.customer.findFirst();
  if (!role || !type || !customer) throw new Error('Seed data is incomplete for load testing');
  const currentCustomers = await prisma.customer.count();
  const customerRows = [];
  for (let i = currentCustomers + 1; i <= 1000; i += 1) customerRows.push({ customerNumber: `LOAD-CUST-${String(i).padStart(5, '0')}`, fullName: `Load Customer ${i}`, phone: `0779${String(i).padStart(7, '0')}`, nationalId: `LOAD${i}`, governorate: 'بغداد' });
  for (let i = 0; i < customerRows.length; i += 200) await prisma.customer.createMany({ data: customerRows.slice(i, i + 200) });
  const currentContracts = await prisma.contract.count();
  const admin = await prisma.user.findFirst({ where: { roleId: role.id } });
  const contractRows = [];
  for (let i = currentContracts + 1; i <= 2000; i += 1) contractRows.push({ contractNumber: `LOAD-CTR-${String(i).padStart(6, '0')}`, contractTypeId: type.id, customerId: customer.id, createdById: admin.id, startDate: new Date('2026-01-01'), status: 'ACTIVE', totalAmount: 100000 + i, paymentMethod: 'CASH' });
  for (let i = 0; i < contractRows.length; i += 200) await prisma.contract.createMany({ data: contractRows.slice(i, i + 200) });
  const snapshot = { customers: await prisma.customer.count(), contracts: await prisma.contract.count(), fields: await prisma.contractField.count(), values: await prisma.contractValue.count() };
  await prisma.$disconnect();
  return {
    type: {
      id: type.id,
      fields: type.templates[0].fields.map((field) => ({ ...field, options: field.options ? JSON.parse(field.options) : [] })),
    },
    customer,
    snapshot,
  };
};

const main = async () => {
  const dataset = await prepareDataset();
  const results = { generatedAt: new Date().toISOString(), durationMs, dataset: dataset.snapshot, stages: [], notes: ['One authenticated token was reused after one login because authLimiter permits 20 login requests per IP.', 'Loopback source addresses were distributed to avoid API limiter distortion during concurrency stages.'] };
  for (const level of levels) {
    for (const scenario of ['read-heavy', 'balanced', 'write-heavy']) {
      copyDatabase(preparedDb, stageDb);
      const started = startServer();
      try {
        await waitForHealth();
        const login = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'Admin@123456' }) });
        const loginData = await login.json();
        if (!loginData.data?.token) throw new Error(`Login failed: ${login.status}`);
        const metrics = await runScenario(level, scenario, loginData.data.token, dataset.type, dataset.customer.id);
        const integrity = await databaseSnapshot();
        results.stages.push({ ...metrics, integrity });
        console.log(JSON.stringify({ level, scenario, ...metrics, counts: integrity.counts }));
      } finally {
        await stopServer(started.server);
        if (started.getStderr()) console.error(started.getStderr());
      }
    }
  }
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${resultsPath}`);
};

main().catch((error) => { console.error(error); process.exitCode = 1; });