const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const node = process.execPath;
const children = new Set();
const apiHealthUrl = 'http://localhost:4000/api/health';

async function apiIsReady() {
  try {
    const response = await fetch(apiHealthUrl, { signal: AbortSignal.timeout(700) });
    if (!response.ok) return false;
    const health = await response.json();
    return health.service === 'grf-payments';
  } catch {
    return false;
  }
}

function launch(label, script, args = []) {
  console.log(`\n[${label}] Démarrage...`);
  const child = spawn(node, [script, ...args], { cwd: root, stdio: 'inherit', env: process.env });
  children.add(child);
  child.once('exit', (code) => {
    children.delete(child);
    if (code && code !== 0) console.error(`[${label}] Arrêt avec le code ${code}.`);
  });
  return child;
}

function stopChildren() {
  for (const child of children) child.kill();
}

async function waitForApi(child) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await apiIsReady()) return true;
    if (child && child.exitCode !== null) return false;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function main() {
  let apiChild;
  if (!(await apiIsReady())) {
    apiChild = launch('API paiements', path.join('server', 'index.js'));
    if (!(await waitForApi(apiChild))) {
      stopChildren();
      throw new Error('L’API de paiement ne démarre pas sur le port 4000. Vérifiez le port et les journaux affichés ci-dessus.');
    }
  } else {
    console.log('[API paiements] Serveur déjà actif sur le port 4000.');
  }

  const angularCli = path.join('node_modules', '@angular', 'cli', 'bin', 'ng.js');
  const frontend = launch('Angular', angularCli, ['serve', '--open', '--proxy-config', 'proxy.conf.json']);
  const shutdown = () => stopChildren();
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  frontend.once('exit', () => {
    if (apiChild) apiChild.kill();
  });
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
  stopChildren();
});
