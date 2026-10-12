#!/usr/bin/env node
/**
 * Run the same shell command in several Calling Bird installs at once
 * (/calling-bird/cb1, cb2, … — the folders next to this one).
 *
 * Run from ONE of them:  npm run command:bulk
 *
 *   1. Pick folders (same picker as deploy:bulk: type to filter, ↑/↓, Space toggle, "Select All", Enter)
 *   2. Type a command → it runs in every selected folder in parallel (output prefixed with the folder name)
 *   3. Type the next command, or:
 *        folders  → pick the folders again
 *        exit     → quit (also: quit, Ctrl+C)
 *
 * One-off (no prompts):
 *   npm run command:bulk -- --folders=cb1,cb2 --cmd="git log -1 --oneline"
 *   npm run command:bulk -- --folders=cb1,cb2 --cmd="npm install" --dry-run   (print only)
 */
const path = require('path');
const readline = require('readline');
const { BASE_DIR, c, fail, parseArgs, chooseFolders, runParallel } = require('./lib/bulk-common');

const args = parseArgs();
const DRY_RUN = !!args['dry-run'];

async function runEverywhere(command, folders) {
  const commands = folders.map(name => ({ name, cwd: path.join(BASE_DIR, name), command }));
  console.log(c.dim(`$ ${command}  (${folders.join(', ')})`));
  if (DRY_RUN) return { ok: folders, failed: [] };

  const startedAt = Date.now();
  const { ok, failed } = await runParallel(commands);
  const took = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `${c.green('✔')} ${ok.join(', ') || c.dim('(none)')}  ·  ` +
    `${failed.length ? c.red('✖ ' + failed.join(', ')) : c.dim('✖ (none)')}  ${c.dim(`${took}s`)}`
  );
  return { ok, failed };
}

(async () => {
  let folders = await chooseFolders(args, { usage: '--folders=cb1,cb2 --cmd="git status"' });

  // One-off mode
  if (args.cmd) {
    const { failed } = await runEverywhere(String(args.cmd), folders);
    process.exit(failed.length ? 1 : 0);
  }

  // Interactive: keep asking for commands until "exit"
  console.log(`\n${c.bold('Selected')}: ${folders.join(', ')}`);
  console.log(c.dim('Type a command to run in all of them · "folders" to reselect · "exit" to quit'));

  // A fresh readline per question, so the folder picker (raw keypress mode) never shares stdin with it
  const askCommand = () => new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('SIGINT', () => { rl.close(); console.log('\nBye.'); process.exit(0); });
    rl.question(`\n${c.cyan(folders.join(', '))} ${c.bold('❯')} `, answer => { rl.close(); resolve(String(answer).trim()); });
  });

  while (true) {
    const line = await askCommand();
    if (!line) continue;
    if (/^(exit|quit)$/i.test(line)) break;
    if (/^folders$/i.test(line)) {
      folders = await chooseFolders({}, { preselected: folders });
      console.log(`${c.bold('Selected')}: ${folders.join(', ')}`);
      continue;
    }
    await runEverywhere(line, folders);
  }
  console.log('Bye.');
  process.exit(0);
})().catch(err => fail(err?.stack || String(err)));
