#!/usr/bin/env node
/**
 * Bulk deploy for several Calling Bird installs that sit side by side, e.g.
 *   /calling-bird/cb1  /calling-bird/cb2  /calling-bird/cb3  /calling-bird/cb4  /calling-bird/cbtest
 *
 * Run from ONE of them:  npm run deploy:bulk
 *
 *   1. Pick folders (type to filter, ↑/↓ move, Space toggle, "Select All", Enter continue)
 *   2. Branch (default: develop) → git fetch + checkout + pull in all selected folders, in parallel (concurrently)
 *   3. front-end build in the CURRENT folder only (watch mode removed from vite.config.mjs for the build, then restored)
 *   4. Copy front-end/dist/assets/* to the other selected folders
 *   5. pm2 restart <folder> --update-env for each selected folder (pm2 process name = folder name)
 *
 * Non-interactive / testing:
 *   npm run deploy:bulk -- --folders=cb1,cb3 --branch=develop --yes
 *   npm run deploy:bulk -- --dry-run          (print the steps, change nothing)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { CURRENT_DIR, BASE_DIR, CURRENT_NAME, c, fail, parseArgs, chooseFolders, ask, runParallel } = require('./lib/bulk-common');

const DEFAULT_BRANCH = 'develop';
const args = parseArgs();
const DRY_RUN = !!args['dry-run'];
const step = (n, title) => console.log(`\n${c.cyan(c.bold(`[${n}/5]`))} ${c.bold(title)}`);

// ------------------------------------------------------------------ steps

function run(cmd, cwd, label) {
  console.log(c.dim(`$ ${cmd}  (${path.relative(BASE_DIR, cwd) || '.'})`));
  if (DRY_RUN) return;
  const res = spawnSync(cmd, { cwd, stdio: 'inherit', shell: true });
  if (res.status !== 0) fail(`${label} failed (exit code ${res.status}).`);
}

async function gitUpdate(folders, branch) {
  const commands = folders.map(name => ({
    name,
    cwd: path.join(BASE_DIR, name),
    command: `git fetch origin && git checkout ${branch} && git pull --ff-only origin ${branch}`,
  }));
  commands.forEach(cmd => console.log(c.dim(`$ ${cmd.command}  (${cmd.name})`)));
  if (DRY_RUN) return;

  const { failed } = await runParallel(commands);
  if (failed.length) fail(`git update failed in: ${failed.join(', ')}. Nothing was built or restarted.`);
}

// Build once in the current folder: watch mode (build.watch in vite.config.mjs) would never exit,
// so remove it for the build and always put the original file back afterwards.
function buildFrontEnd() {
  const frontEnd = path.join(CURRENT_DIR, 'front-end');
  const configPath = path.join(frontEnd, 'vite.config.mjs');
  if (!fs.existsSync(configPath)) fail(`Not found: ${configPath}`);

  const original = fs.readFileSync(configPath, 'utf8');
  const WATCH_BLOCK = /\n[ \t]*watch:\s*\{[^{}]*\},?[ \t]*(?=\n)/;
  const withoutWatch = original.replace(WATCH_BLOCK, '');
  if (withoutWatch === original) console.log(c.yellow('! No "watch: { … }" block found in vite.config.mjs; building as is.'));

  console.log(c.dim(`~ remove build.watch from front-end/vite.config.mjs (restored after the build)`));
  if (DRY_RUN) { run('npm run build', frontEnd, 'Front-end build'); return; }

  const restore = () => {
    if (fs.readFileSync(configPath, 'utf8') !== original) {
      fs.writeFileSync(configPath, original);
      console.log(c.dim('~ restored front-end/vite.config.mjs'));
    }
  };
  const onSignal = () => { restore(); process.exit(130); };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    fs.writeFileSync(configPath, withoutWatch);
    run('npm run build', frontEnd, 'Front-end build');
  } finally {
    restore();
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
  }
}

function copyAssets(targets) {
  const src = path.join(CURRENT_DIR, 'front-end', 'dist', 'assets');
  if (!DRY_RUN && !fs.existsSync(src)) fail(`Build output not found: ${src}`);
  if (!targets.length) { console.log(c.dim('(no other folders selected)')); return; }
  targets.forEach(name => {
    const dest = path.join(BASE_DIR, name, 'front-end', 'dist', 'assets');
    console.log(c.dim(`~ copy front-end/dist/assets/* → ${name}/front-end/dist/assets/`));
    if (DRY_RUN) return;
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
  });
}

// Only the selected installs are restarted; each pm2 process is named after its folder (cb1, cb2, …).
// One failing restart does not stop the others; failures are returned and reported at the end.
function restartSelected(names) {
  const failed = [];
  names.forEach(name => {
    const cmd = `pm2 restart ${name} --update-env`;
    console.log(c.dim(`$ ${cmd}`));
    if (DRY_RUN) return;
    const res = spawnSync(cmd, { cwd: path.join(BASE_DIR, name), stdio: 'inherit', shell: true });
    if (res.status !== 0) failed.push(name);
  });
  return failed;
}

// ------------------------------------------------------------------ main

(async () => {
  let chosen = await chooseFolders(args, { currentTag: '(current: builds here)', usage: '--folders=cb1,cb2 --branch=develop --yes' });

  // The build runs here and its assets are copied to the others, so this folder must be updated too
  if (!chosen.includes(CURRENT_NAME)) {
    chosen = [CURRENT_NAME, ...chosen];
    console.log(c.yellow(`! Added "${CURRENT_NAME}" (current folder): it is built and copied to the others, so it must be updated too.`));
  }

  const branch = String(args.branch || (args.yes ? DEFAULT_BRANCH : await ask(`Branch to deploy ${c.dim(`(${DEFAULT_BRANCH})`)}: `, DEFAULT_BRANCH)));
  if (!/^[\w./-]+$/.test(branch)) fail(`Invalid branch name: ${branch}`);
  const others = chosen.filter(f => f !== CURRENT_NAME);

  console.log(`\n${c.bold('Plan')}${DRY_RUN ? c.yellow('  (dry run: nothing will be changed)') : ''}`);
  console.log(`  Folders : ${chosen.join(', ')}`);
  console.log(`  Branch  : ${branch}`);
  console.log(`  Build in: ${CURRENT_NAME}  →  assets copied to: ${others.join(', ') || '(none)'}`);
  console.log(`  Restart : ${chosen.map(name => `pm2 restart ${name}`).join(', ')}  (--update-env)`);
  if (!args.yes && !DRY_RUN) {
    const ok = await ask(`\nProceed? ${c.dim('(y/N)')} `, 'n');
    if (!/^y(es)?$/i.test(ok)) { console.log('Cancelled.'); process.exit(0); }
  }

  const startedAt = Date.now();
  step(1, `git checkout ${branch} + pull (${chosen.length} folder${chosen.length > 1 ? 's' : ''}, in parallel)`);
  await gitUpdate(chosen, branch);

  step(2, `Build front-end in ${CURRENT_NAME}`);
  buildFrontEnd();

  step(3, 'Copy assets to the other folders');
  copyAssets(others);

  step(4, 'Restart the selected pm2 processes');
  const restartFailed = restartSelected(chosen);

  step(5, 'Done');
  if (restartFailed.length) {
    console.log(c.yellow(`! Code deployed, but pm2 restart failed for: ${restartFailed.join(', ')}. Check "pm2 list" (the pm2 name must match the folder name).`));
  }
  console.log(c.green(`✔ Deployed ${branch} to ${chosen.join(', ')} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s${DRY_RUN ? ' (dry run)' : ''}`));
})().catch(err => fail(err?.stack || String(err)));
