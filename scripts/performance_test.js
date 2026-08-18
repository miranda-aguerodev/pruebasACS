const { performance } = require("node:perf_hooks");

const BASE_URL =
  process.env.PERF_BASE_URL ||
  "http://localhost:3000";

const EMAIL =
  process.env.PERF_EMAIL ||
  "admin@novatech.com";

const PASSWORD =
  process.env.PERF_PASSWORD ||
  "Admin123!";

const ITERATIONS = Number(
  process.env.PERF_ITERATIONS || 20
);

const CONCURRENCY = Number(
  process.env.PERF_CONCURRENCY || 10
);

const AVG_THRESHOLD_MS = 500;
const P95_THRESHOLD_MS = 1000;
const CONCURRENT_THRESHOLD_MS = 2000;

async function timedRequest(url, options = {}) {
  const start = performance.now();

  const response = await fetch(url, options);

  const elapsed = performance.now() - start;

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${
        typeof data === "string"
          ? data
          : JSON.stringify(data)
      }`
    );
  }

  return {
    milliseconds: elapsed,
    status: response.status,
    data,
  };
}

function percentile(values, percentileValue) {
  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const index = Math.min(
    sorted.length - 1,
    Math.ceil(
      (percentileValue / 100) *
        sorted.length
    ) - 1
  );

  return sorted[index];
}

function calculateStats(values) {
  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: total / values.length,
    p95: percentile(values, 95),
  };
}

function formatMilliseconds(value) {
  return `${value.toFixed(2)} ms`;
}

function printStats(name, values) {
  const stats = calculateStats(values);

  const averagePass =
    stats.average <= AVG_THRESHOLD_MS;

  const p95Pass =
    stats.p95 <= P95_THRESHOLD_MS;

  console.log(`\n${name}`);
  console.log("-".repeat(name.length));

  console.log(
    `Iteraciones: ${values.length}`
  );

  console.log(
    `Mínimo:     ${formatMilliseconds(
      stats.min
    )}`
  );

  console.log(
    `Promedio:   ${formatMilliseconds(
      stats.average
    )}`
  );

  console.log(
    `P95:        ${formatMilliseconds(
      stats.p95
    )}`
  );

  console.log(
    `Máximo:     ${formatMilliseconds(
      stats.max
    )}`
  );

  console.log(
    `Promedio <= ${AVG_THRESHOLD_MS} ms: ${
      averagePass ? "PASS" : "FAIL"
    }`
  );

  console.log(
    `P95 <= ${P95_THRESHOLD_MS} ms: ${
      p95Pass ? "PASS" : "FAIL"
    }`
  );

  return averagePass && p95Pass;
}

async function measureLogin() {
  const times = [];
  let token = null;

  for (
    let iteration = 0;
    iteration < ITERATIONS;
    iteration += 1
  ) {
    const result = await timedRequest(
      `${BASE_URL}/api/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email: EMAIL,
          password: PASSWORD,
        }),
      }
    );

    times.push(result.milliseconds);
    token = result.data.token;
  }

  return {
    times,
    token,
  };
}

async function measureAuthenticatedGet(
  path,
  token
) {
  const times = [];

  for (
    let iteration = 0;
    iteration < ITERATIONS;
    iteration += 1
  ) {
    const result = await timedRequest(
      `${BASE_URL}${path}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    times.push(result.milliseconds);
  }

  return times;
}

async function getRequestId(token) {
  const result = await timedRequest(
    `${BASE_URL}/api/solicitudes`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  if (
    !Array.isArray(result.data) ||
    result.data.length === 0
  ) {
    throw new Error(
      "No existen solicitudes para medir el historial."
    );
  }

  return result.data[0].id;
}

async function measureConcurrentRequests(
  token
) {
  const start = performance.now();

  const results = await Promise.all(
    Array.from(
      { length: CONCURRENCY },
      () =>
        timedRequest(
          `${BASE_URL}/api/solicitudes`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )
    )
  );

  const totalMilliseconds =
    performance.now() - start;

  const individualTimes = results.map(
    (result) => result.milliseconds
  );

  return {
    totalMilliseconds,
    individualTimes,
    successful: results.length,
  };
}

async function run() {
  console.log(
    "NovaTech - Prueba básica de rendimiento"
  );

  console.log(
    `Servidor: ${BASE_URL}`
  );

  console.log(
    `Iteraciones por endpoint: ${ITERATIONS}`
  );

  console.log(
    `Concurrencia: ${CONCURRENCY}`
  );

  console.log("\nCriterios");

  console.log(
    `- Promedio <= ${AVG_THRESHOLD_MS} ms`
  );

  console.log(
    `- P95 <= ${P95_THRESHOLD_MS} ms`
  );

  console.log(
    `- ${CONCURRENCY} solicitudes concurrentes <= ${CONCURRENT_THRESHOLD_MS} ms`
  );

  console.log("- Errores HTTP = 0");

  const login = await measureLogin();

  const loginPass = printStats(
    "LOGIN - POST /api/login",
    login.times
  );

  const requestTimes =
    await measureAuthenticatedGet(
      "/api/solicitudes",
      login.token
    );

  const requestsPass = printStats(
    "SOLICITUDES - GET /api/solicitudes",
    requestTimes
  );

  const requestId =
    await getRequestId(login.token);

  const historyTimes =
    await measureAuthenticatedGet(
      `/api/solicitudes/${requestId}/historial`,
      login.token
    );

  const historyPass = printStats(
    `HISTORIAL - GET /api/solicitudes/${requestId}/historial`,
    historyTimes
  );

  const concurrent =
    await measureConcurrentRequests(
      login.token
    );

  const concurrencyPass =
    concurrent.totalMilliseconds <=
      CONCURRENT_THRESHOLD_MS &&
    concurrent.successful === CONCURRENCY;

  console.log(
    "\nCARGA CONCURRENTE BÁSICA"
  );

  console.log(
    "------------------------"
  );

  console.log(
    `Solicitudes simultáneas: ${CONCURRENCY}`
  );

  console.log(
    `Respuestas exitosas: ${concurrent.successful}/${CONCURRENCY}`
  );

  console.log(
    `Tiempo total del lote: ${formatMilliseconds(
      concurrent.totalMilliseconds
    )}`
  );

  console.log(
    `Promedio individual: ${formatMilliseconds(
      calculateStats(
        concurrent.individualTimes
      ).average
    )}`
  );

  console.log(
    `Lote <= ${CONCURRENT_THRESHOLD_MS} ms: ${
      concurrencyPass
        ? "PASS"
        : "FAIL"
    }`
  );

  const finalPass =
    loginPass &&
    requestsPass &&
    historyPass &&
    concurrencyPass;

  console.log(
    "\n=============================="
  );

  console.log(
    `RESULTADO GENERAL: ${
      finalPass ? "PASS" : "FAIL"
    }`
  );

  console.log(
    "=============================="
  );

  if (!finalPass) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(
    "\nLa prueba no pudo completarse:"
  );

  console.error(error.message);

  process.exitCode = 1;
});