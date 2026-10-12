/**
 * Shared helpers for the bulk scripts (deploy-bulk.js, command-bulk.js):
 * finding the installs that sit side by side (/calling-bird/cb1, cb2, …), the folder checkbox picker,
 * prompts, colours and running one command in many folders at once with concurrently.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CURRENT_DIR = path.resolve(__dirname, '..', '..');     // the install the command runs from
const BASE_DIR = path.dirname(CURRENT_DIR);                  // one step back: the folder holding all installs
const CURRENT_NAME = path.basename(CURRENT_DIR);

const c = {
  bold: s => `\x1b[1m${s}\x1b[0m`, dim: s => `\x1b[2m${s}\x1b[0m`, green: s => `\x1b[32m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`, yellow: s => `\x1b[33m${s}\x1b[0m`, cyan: s => `\x1b[36m${s}\x1b[0m`,
};

const fail = (msg) => { console.error(`\n${c.red('✖')} ${msg}`); process.exit(1); };

/** --key=value / --flag  →  { key: 'value', flag: true } */
function parseArgs(argv = process.argv.slice(2)) {
  return Object.fromEntries(argv.map(a => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  }));
}

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
function selectFolders(folders, { currentTag = '(current)', preselected = [] } = {}) {
  return new Promise((resolve) => {
    let filter = '';
    let cursor = 0;
    const selected = new Set(preselected.filter(f => folders.includes(f)));
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
        const tag = row === CURRENT_NAME ? c.dim(`  ${currentTag}`) : '';
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

/** Folders from --folders=cb1,cb2, or the interactive picker */
async function chooseFolders(args, { currentTag, usage, preselected } = {}) {
  const folders = listInstallFolders();
  if (!folders.length) fail(`No Calling Bird folders (with .git and front-end) found in ${BASE_DIR}`);
  if (args.folders) {
    const wanted = String(args.folders).split(',').map(s => s.trim()).filter(Boolean);
    const unknown = wanted.filter(w => !folders.includes(w));
    if (unknown.length) fail(`Unknown folder(s): ${unknown.join(', ')}. Available: ${folders.join(', ')}`);
    return wanted;
  }
  if (!process.stdin.isTTY) fail(`Run this in a terminal, or pass ${usage || '--folders=cb1,cb2'}`);
  return selectFolders(folders, { currentTag, preselected });
}

function ask(question, fallback) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim() || fallback); });
  });
}

/**
 * Run commands in parallel with prefixed output: [{ name, cwd, command }].
 * One failing does not stop the others. Resolves { ok: [names], failed: [names] }.
 */
async function runParallel(commands) {
  let concurrently;
  try { ({ concurrently } = require('concurrently')); }
  catch (e) { fail('The "concurrently" package is not installed. Run "npm install" in this folder first.'); }

  const { result } = concurrently(commands, {
    prefix: 'name',
    prefixColors: ['cyan', 'magenta', 'yellow', 'green', 'blue', 'red'],
  });
  let events;
  try { events = await result; }
  catch (failedEvents) { events = Array.isArray(failedEvents) ? failedEvents : []; }

  const failed = events.filter(e => e.exitCode !== 0).map(e => e.command?.name).filter(Boolean);
  const ok = commands.map(cmd => cmd.name).filter(name => !failed.includes(name));
  return { ok, failed };
}

module.exports = { CURRENT_DIR, BASE_DIR, CURRENT_NAME, c, fail, parseArgs, listInstallFolders, selectFolders, chooseFolders, ask, runParallel };
