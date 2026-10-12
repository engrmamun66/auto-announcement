#!/usr/bin/env node
/**
 * Bulk deploy for several Calling Bird installs that sit side by side, e.g.
 *   /calling-bird/cb1  /calling-bird/cb2  /calling-bird/cb3  /calling-bird/cb4  /calling-bird/cbtest
 *
 * Run from ONE of them:  npm run deploy:bulk
 *
 *   1. Pick folders (type to filter, ↑/↓ move, Space toggle, "Select All", Enter continue)
 *   2. Branch (default: master) → git fetch + checkout + pull in all selected folders, in parallel (concurrently)
 *   3. front-end build in the CURRENT folder only (watch mode removed from vite.config.mjs for the build, then restored)
 *   4. Copy front-end/dist/assets/* to the other selected folders
 *   5. pm2 restart all --update-env
 *
 * Non-interactive / testing:
 *   npm run deploy:bulk -- --folders=cb1,cb3 --branch=master --yes
 *   npm run deploy:bulk -- --dry-run          (print the steps, change nothing)
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const CURRENT_DIR = path.resolve(__dirname, '..');           // the install this command runs from
const BASE_DIR = path.dirname(CURRENT_DIR);                  // one step back: the folder holding all installs
const CURRENT_NAME = path.basename(CURRENT_DIR);

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const DRY_RUN = !!args['dry-run'];

const c = {
  bold: s => `\x1b[1m${s}\x1b[0m`, dim: s => `\x1b[2m${s}\x1b[0m`, green: s => `\x1b[32m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`, yellow: s => `\x1b[33m${s}\x1b[0m`, cyan: s => `\x1b[36m${s}\x1b[0m`,
};
const step = (n, title) => console.log(`\n${c.cyan(c.bold(`[${n}/5]`))} ${c.bold(title)}`);
const fail = (msg) => { console.error(`\n${c.red('✖')} ${msg}`); process.exit(1); };

// ------------------------------------------------------------------ folders

function listInstallFolders() {
  return fs.readdirSync(BASE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .filter(name => {
      const dir = path.join(BASE_DIR, name);
      // a Calling Bird install: git checkout with a front-end folder
      return fs.existsSync(path.join(dir, '.git')) && fs.existsSync(path.join(dir, 'front-end'));
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Checkbox list: type to filter, ↑/↓ move, Space toggle, Enter confirm, Esc clear filter, Ctrl+C quit */
function selectFolders(folders) {
  return new Promise((resolve) => {
    let filter = '';
    let cursor = 0;
    const selected = new Set();
    const ALL = '__all__';

    const visible = () => folders.filter(f => f.toLowerCase().includes(filter));
    const rows = () => [ALL, ...visible()];

    const render = () => {
      const list = visible();
      const allOn = list.length > 0 && list.every(f => selected.has(f));
      const out = [];
      out.push(`${c.bold('Select folders')} ${c.dim(`in ${BASE_DIR}`)}`);
      out.push(c.dim('Type to filter · ↑/↓ move · Space toggle · Enter continue · Esc clear filter · Ctrl+C quit'));
      out.push(`Filter: ${filter ? c.yellow(filter) : c.dim('(none)')}`);
      out.push('');
      rows().forEach((row, i) => {
        const pointer = i === cursor ? c.cyan('❯') : ' ';
        if (row === ALL) {
          out.push(`${pointer} ${allOn ? c.green('[x]') : '[ ]'} ${c.bold('Select All')}`);
          out.push('  ' + c.dim('─'.repeat(28)));
          return;
        }
        const mark = selected.has(row) ? c.green('[x]') : '[ ]';
        const tag = row === CURRENT_NAME ? c.dim('  (current: builds here)') : '';
        out.push(`${pointer} ${mark} ${row}${tag}`);
      });
      if (!visible().length) out.push(c.dim('  no folders match'));
      out.push('');
      out.push(`${c.bold(selected.size)} selected`);
      process.stdout.write('\x1b[2J\x1b[H' + out.join('\n') + '\n');
    };

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === 'c') { cleanup(); console.log('\nCancelled.'); process.exit(130); }
      const r = rows();
      if (key.name === 'up') cursor = (cursor - 1 + r.length) % r.length;
      else if (key.name === 'down') cursor = (cursor + 1) % r.length;
      else if (key.name === 'space') {
        const row = r[cursor];
        if (row === ALL) {
          const list = visible();
          const allOn = list.length > 0 && list.every(f => selected.has(f));
          list.forEach(f => allOn ? selected.delete(f) : selected.add(f));
        } else if (row) {
          selected.has(row) ? selected.delete(row) : selected.add(row);
        }
      } else if (key.name === 'return') {
        if (!selected.size) { render(); process.stdout.write(c.red('Select at least one folder (Space to tick).\n')); return; }
        cleanup();
        resolve(folders.filter(f => selected.has(f)));
        return;
      } else if (key.name === 'escape') { filter = ''; cursor = 0; }
      else if (key.name === 'backspace') { filter = filter.slice(0, -1); cursor = 0; }
      else if (str && /^[\w.-]$/.test(str)) { filter += str.toLowerCase(); cursor = 0; }
      render();
    };

    const cleanup = () => {
      process.stdin.off('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    process.stdin.on('keypress', onKey);
    render();
  });
}

function ask(question, fallback) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim() || fallback); });
  });
}

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

  let concurrently;
  try { ({ concurrently } = require('concurrently')); }
  catch (e) { fail('The "concurrently" package is not installed. Run "npm install" in this folder first.'); }

  const { result } = concurrently(commands, {
    prefix: 'name',
    prefixColors: ['cyan', 'magenta', 'yellow', 'green', 'blue', 'red'],
    killOthers: [],
  });
  try {
    await result;
  } catch (events) {
    const failed = (Array.isArray(events) ? events : []).filter(e => e.exitCode !== 0).map(e => e.command?.name).filter(Boolean);
    fail(`git update failed in: ${failed.join(', ') || 'one or more folders'}. Nothing was built or restarted.`);
  }
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

// ------------------------------------------------------------------ main

(async () => {
  const folders = listInstallFolders();
  if (!folders.length) fail(`No Calling Bird folders (with .git and front-end) found in ${BASE_DIR}`);

  let chosen;
  if (args.folders) {
    const wanted = String(args.folders).split(',').map(s => s.trim()).filter(Boolean);
    const unknown = wanted.filter(w => !folders.includes(w));
    if (unknown.length) fail(`Unknown folder(s): ${unknown.join(', ')}. Available: ${folders.join(', ')}`);
    chosen = wanted;
  } else {
    if (!process.stdin.isTTY) fail('Run this in a terminal, or pass --folders=cb1,cb2 --branch=master --yes');
    chosen = await selectFolders(folders);
  }

  // The build runs here and its assets are copied to the others, so this folder must be updated too
  if (!chosen.includes(CURRENT_NAME)) {
    chosen = [CURRENT_NAME, ...chosen];
    console.log(c.yellow(`! Added "${CURRENT_NAME}" (current folder): it is built and copied to the others, so it must be updated too.`));
  }

  const branch = String(args.branch || (args.yes ? 'master' : await ask(`Branch to deploy ${c.dim('(master)')}: `, 'master')));
  if (!/^[\w./-]+$/.test(branch)) fail(`Invalid branch name: ${branch}`);
  const others = chosen.filter(f => f !== CURRENT_NAME);

  console.log(`\n${c.bold('Plan')}${DRY_RUN ? c.yellow('  (dry run: nothing will be changed)') : ''}`);
  console.log(`  Folders : ${chosen.join(', ')}`);
  console.log(`  Branch  : ${branch}`);
  console.log(`  Build in: ${CURRENT_NAME}  →  assets copied to: ${others.join(', ') || '(none)'}`);
  console.log(`  Then    : pm2 restart all --update-env`);
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

  step(4, 'Restart pm2');
  run('pm2 restart all --update-env', CURRENT_DIR, 'pm2 restart');

  step(5, 'Done');
  console.log(c.green(`✔ Deployed ${branch} to ${chosen.join(', ')} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s${DRY_RUN ? ' (dry run)' : ''}`));
})().catch(err => fail(err?.stack || String(err)));
