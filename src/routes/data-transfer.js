const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const moment = require('moment');
const multer = require('multer');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { updateSetting } = require('../settings');

/**
 * Excel export / import for the Import page.
 *
 *   GET  /data/export?parts=students,schedules,settings,attendance  → one .xlsx, one sheet per part
 *   POST /data/import/inspect   (multipart "file")                  → sheet list + suggested mapping
 *   POST /data/import/run       { token, mapping, force_as_new_entry } → imports the mapped sheets
 *   GET  /data/media/export                                         → public/media as a .zip
 *   POST /data/media/import     (multipart "file", overwrite)        → extracts a .zip into public/media
 */

const PARTS = ['students', 'schedules', 'settings', 'attendance'];
const SHEET_NAMES = { students: 'Students', schedules: 'Schedules', settings: 'Settings', attendance: 'Attendance' };
const ATTENDANCE_MONTHS = 12;
const ATTENDANCE_COLUMNS = ['student_id', 'date', 'in_time', 'out_time', 'late_in_minute', 'status', 'remarks', 'shift_duration', 'shift_count', 'shift_number', 'device_index'];
const EXCEL_CELL_LIMIT = 30000; // Excel cells hold max 32,767 chars; long settings (e.g. an embedded logo) are split into parts

// How a sheet is recognised when suggesting a mapping: by its name, or by having all of these columns
const SIGNATURES = {
  students: { names: ['students', 'student'], columns: ['name', 'dakhela', 'class'] },
  schedules: { names: ['schedules', 'schedule'], columns: ['type', 'start_time', 'end_time'] },
  settings: { names: ['settings', 'setting'], columns: ['key', 'value'] },
  attendance: { names: ['attendance', 'attendances', 'attendence'], columns: ['student_id', 'date', 'status'] },
};

module.exports = (db, Students, { upload }) => {
  const router = express.Router();
  const TEMP_DIR = path.join(global.DIR, 'public', 'temp');

  const dbAll = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || [])));
  const dbGet = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
  const dbRun = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function (err) { err ? reject(err) : resolve(this); }));

  // ------------------------------------------------------------------ Export

  function sheetFrom(rows, emptyHeader) {
    const ws = rows.length ? xlsx.utils.json_to_sheet(rows) : xlsx.utils.aoa_to_sheet([emptyHeader]);
    const ref = ws['!ref'];
    if (ref) {
      const range = xlsx.utils.decode_range(ref);
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = xlsx.utils.encode_cell({ r: 0, c });
        if (ws[addr]) ws[addr].s = { font: { bold: true } };
      }
    }
    return ws;
  }

  async function settingsRows() {
    const rows = await dbAll('SELECT key, value FROM settings ORDER BY key ASC');
    const out = [];
    rows.forEach(({ key, value }) => {
      const text = String(value ?? '');
      const parts = Math.max(1, Math.ceil(text.length / EXCEL_CELL_LIMIT));
      for (let i = 0; i < parts; i++) {
        out.push({ key, part: i + 1, value: text.slice(i * EXCEL_CELL_LIMIT, (i + 1) * EXCEL_CELL_LIMIT) });
      }
    });
    return out;
  }

  router.get('/data/export', async (req, res) => {
    const requested = String(req.query.parts || '').split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
    const parts = PARTS.filter(p => requested.includes(p));
    if (!parts.length) return res.status(400).json({ error: `Choose at least one of: ${PARTS.join(', ')}` });

    try {
      const workbook = xlsx.utils.book_new();
      for (const part of parts) {
        let ws;
        if (part === 'students') {
          ws = sheetFrom(await dbAll('SELECT * FROM students ORDER BY id ASC'), ['id', 'name', 'dakhela', 'class', 'class_short']);
        } else if (part === 'schedules') {
          ws = sheetFrom(await dbAll('SELECT * FROM schedules ORDER BY id ASC'), ['id', 'type', 'title', 'start_time', 'end_time', 'classes', 'status', 'order_index']);
        } else if (part === 'settings') {
          ws = sheetFrom(await settingsRows(), ['key', 'part', 'value']);
        } else if (part === 'attendance') {
          const since = moment().subtract(ATTENDANCE_MONTHS, 'months').format('YYYY-MM-DD');
          ws = sheetFrom(await dbAll('SELECT * FROM attendance WHERE date >= ? ORDER BY date ASC, id ASC', [since]), ['id', ...ATTENDANCE_COLUMNS]);
        }
        xlsx.utils.book_append_sheet(workbook, ws, SHEET_NAMES[part]);
      }

      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
      const label = parts.length === PARTS.length ? 'everything' : parts.join('_');
      const fileName = `callingbird_${label}_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.send(buffer);
    } catch (err) {
      console.error('[data/export]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------ Import: inspect

  function cleanOldUploads() {
    fs.readdir(TEMP_DIR, (err, files) => {
      if (err) return;
      const cutoff = Date.now() - 60 * 60 * 1000;
      files.filter(f => /^[a-f0-9]{32}$/.test(f)).forEach(f => {
        const full = path.join(TEMP_DIR, f);
        fs.stat(full, (statErr, st) => { if (!statErr && st.mtimeMs < cutoff) fs.unlink(full, () => {}); });
      });
    });
  }

  function tokenPath(token) {
    if (!/^[a-f0-9]{32}$/.test(String(token || ''))) return null;
    const full = path.join(TEMP_DIR, token);
    return fs.existsSync(full) ? full : null;
  }

  function suggestMapping(sheets) {
    const mapping = {};
    const used = new Set();
    // 1) by sheet name, 2) by columns
    for (const pass of ['name', 'columns']) {
      for (const part of PARTS) {
        if (mapping[part]) continue;
        const sig = SIGNATURES[part];
        const match = sheets.find(sh => !used.has(sh.name) && (pass === 'name'
          ? sig.names.includes(String(sh.name).trim().toLowerCase())
          : sig.columns.every(col => sh.headers.map(h => String(h).trim().toLowerCase()).includes(col))));
        if (match) { mapping[part] = match.name; used.add(match.name); }
      }
    }
    return mapping;
  }

  router.post('/data/import/inspect', upload.single('file'), (req, res) => {
    cleanOldUploads();
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });
    if (!/\.(xlsx|xls)$/i.test(file.originalname)) {
      fs.unlink(file.path, () => {});
      return res.status(400).json({ error: 'Only Excel files (.xlsx, .xls) are supported.' });
    }
    try {
      const workbook = xlsx.readFile(file.path);
      const sheets = workbook.SheetNames.map(name => {
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[name], { header: 1, blankrows: false });
        return {
          name,
          rows: Math.max(0, rows.length - 1),
          headers: (rows[0] || []).map(h => String(h ?? '').trim()).filter(Boolean),
        };
      });
      res.json({
        token: path.basename(file.path),
        file_name: file.originalname,
        sheets,
        suggested: suggestMapping(sheets),
        attendance_months: ATTENDANCE_MONTHS,
      });
    } catch (err) {
      fs.unlink(file.path, () => {});
      res.status(400).json({ error: `Could not read the Excel file: ${err.message}` });
    }
  });

  // ------------------------------------------------------------------ Import: run

  async function importSettings(ws) {
    const rows = xlsx.utils.sheet_to_json(ws, { defval: null, raw: false });
    const grouped = {};
    rows.forEach(r => {
      const key = String(r.key ?? '').trim();
      if (!key) return;
      (grouped[key] = grouped[key] || []).push({ part: Number(r.part) || 1, value: r.value ?? '' });
    });

    const allowed = new Set(Object.keys(global.config || {}).filter(k => k !== 'env'));
    const report = { updated: [], skipped: [] };
    for (const [key, parts] of Object.entries(grouped)) {
      if (!allowed.has(key)) { report.skipped.push({ key, reason: 'unknown setting' }); continue; }
      const text = parts.sort((a, b) => a.part - b.part).map(p => String(p.value)).join('');
      let value;
      try { value = JSON.parse(text); } catch (e) { report.skipped.push({ key, reason: 'invalid JSON value' }); continue; }
      await updateSetting(db, key, value);
      if (global.config) global.config[key] = value;
      report.updated.push(key);
    }
    return report;
  }

  async function importAttendance(ws, forceAsNew) {
    const rows = xlsx.utils.sheet_to_json(ws, { defval: null, raw: false });
    const report = { total: rows.length, created: 0, updated: 0, skipped: 0, errors: 0, issues: [] };
    const blank = v => v === null || v === undefined || String(v).trim() === '';
    const cols = ATTENDANCE_COLUMNS.join(', ');
    const placeholders = ATTENDANCE_COLUMNS.map(() => '?').join(', ');
    const setClause = ATTENDANCE_COLUMNS.map(c => `${c} = ?`).join(', ');
    // attendance.student_id is the student's dakhela; read after the students import so new students count
    const knownDakhela = new Set((await dbAll('SELECT dakhela FROM students')).map(r => String(r.dakhela).trim()));

    // One transaction: thousands of rows would otherwise take minutes (one disk sync per row)
    let inTransaction = false;
    try { await dbRun('BEGIN'); inTransaction = true; } catch (e) { /* already in a transaction */ }
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const excelRow = i + 2;
        const rec = {};
        ATTENDANCE_COLUMNS.forEach(c => { rec[c] = blank(row[c]) ? null : String(row[c]).trim(); });
        if (!rec.student_id || !rec.date) {
          report.skipped++;
          report.issues.push({ excelRow, student_id: rec.student_id, date: rec.date, status: 'skipped', reason: 'missing student_id/date' });
          continue;
        }
        // status is NOT NULL but may legitimately be empty in the source database; keep it as-is
        if (rec.status === null) rec.status = '';
        if (!knownDakhela.has(String(rec.student_id))) {
          report.skipped++;
          report.issues.push({ excelRow, student_id: rec.student_id, date: rec.date, status: 'skipped', reason: 'student not found (no student with this dakhela)' });
          continue;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)) {
          const parsed = moment(rec.date, ['YYYY-MM-DD', 'M/D/YY', 'M/D/YYYY', 'D/M/YYYY', 'DD-MM-YYYY'], true);
          if (!parsed.isValid()) {
            report.skipped++;
            report.issues.push({ excelRow, student_id: rec.student_id, date: rec.date, status: 'skipped', reason: 'date must be YYYY-MM-DD' });
            continue;
          }
          rec.date = parsed.format('YYYY-MM-DD');
        }
        rec.shift_number = rec.shift_number || '1';
        const values = ATTENDANCE_COLUMNS.map(c => rec[c]);
        try {
          let existing = null;
          if (!forceAsNew) {
            if (!blank(row.id)) existing = await dbGet('SELECT id FROM attendance WHERE id = ?', [row.id]);
            if (!existing) existing = await dbGet('SELECT id FROM attendance WHERE student_id = ? AND date = ? AND shift_number = ?', [rec.student_id, rec.date, rec.shift_number]);
          }
          if (existing) {
            await dbRun(`UPDATE attendance SET ${setClause} WHERE id = ?`, [...values, existing.id]);
            report.updated++;
          } else {
            await dbRun(`INSERT INTO attendance (${cols}) VALUES (${placeholders})`, values);
            report.created++;
          }
        } catch (err) {
          report.errors++;
          report.issues.push({ excelRow, student_id: rec.student_id, date: rec.date, status: 'error', reason: err.message });
        }
      }
    } finally {
      if (inTransaction) await dbRun('COMMIT').catch(err => console.error('[data/import] attendance commit', err));
    }
    report.issues = report.issues.slice(0, 500);
    return report;
  }

  router.post('/data/import/run', async (req, res) => {
    const { token, mapping = {}, force_as_new_entry } = req.body || {};
    const filePath = tokenPath(token);
    if (!filePath) return res.status(400).json({ error: 'The uploaded file has expired. Please choose the file again.' });

    const forceAsNew = force_as_new_entry === true || force_as_new_entry === 'true';
    const report = {};
    try {
      const workbook = xlsx.readFile(filePath);
      const chosen = PARTS.filter(p => mapping[p]);
      if (!chosen.length) return res.status(400).json({ error: 'Map at least one sheet to import.' });
      for (const part of chosen) {
        if (!workbook.Sheets[mapping[part]]) return res.status(400).json({ error: `Sheet "${mapping[part]}" was not found in the file.` });
      }

      const runImportExcel = (options) => new Promise((resolve, reject) => {
        Students.importExcel(filePath, forceAsNew, (err, result) => {
          if (err) return reject(new Error(String(err?.message || err)));
          resolve(result);
        }, { keepFile: true, ...options });
      });

      // Order matters: settings (class list decides which students are accepted) → schedules → students → attendance
      if (mapping.settings) report.settings = await importSettings(workbook.Sheets[mapping.settings]);

      let schedulesResult = null;
      if (mapping.schedules) {
        // When students follow, they run the post-import access check / backup once at the end
        schedulesResult = await runImportExcel({ studentsSheet: null, schedulesSheet: mapping.schedules, skipAfterImport: !!mapping.students });
      }

      if (mapping.students) {
        const studentsResult = await runImportExcel({ studentsSheet: mapping.students, schedulesSheet: null });
        report.students = { ...studentsResult, schedules: schedulesResult?.schedules || [] };
      } else if (schedulesResult) {
        report.students = { ...schedulesResult, students: [] };
      }

      if (mapping.attendance) report.attendance = await importAttendance(workbook.Sheets[mapping.attendance], forceAsNew);

      res.json(report);
    } catch (err) {
      console.error('[data/import/run]', err);
      res.status(500).json({ error: err.message, partial: report });
    } finally {
      fs.unlink(filePath, () => {});
    }
  });

  // ------------------------------------------------------------------ Media (.zip)
  // public/media holds students' audio (sound1) and profile images, referenced as /media/<file name>

  const MEDIA_DIR = path.join(global.DIR, 'public', 'media');
  const SAFE_MEDIA_NAME = /^[\w\-. ()]+$/; // plain file names only (no folders, no "..")
  // Media is served from this site, so only audio/images (and extension-less recordings like "…-blob"); no html/js/svg
  const MEDIA_EXTENSIONS = new Set(['', 'mp3', 'wav', 'ogg', 'oga', 'opus', 'webm', 'm4a', 'aac', 'flac', 'amr', '3gp', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);
  const zipUpload = multer({ dest: TEMP_DIR, limits: { fileSize: 1024 * 1024 * 1024 } }); // 1 GB

  router.get('/data/media/export', (req, res) => {
    if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
    const fileName = `callingbird_media_${moment().format('YYYY-MM-DD_HH-mm')}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => {
      console.error('[data/media/export]', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
      else res.end();
    });
    archive.pipe(res);
    fs.readdirSync(MEDIA_DIR, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .forEach(entry => archive.file(path.join(MEDIA_DIR, entry.name), { name: entry.name }));
    archive.finalize();
  });

  router.post('/data/media/import', zipUpload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });
    const overwrite = req.body?.overwrite === 'true' || req.query.overwrite === 'true';
    const report = { added: [], replaced: [], skipped: [], rejected: [] };
    try {
      if (!/\.zip$/i.test(file.originalname)) return res.status(400).json({ error: 'Only .zip files are supported.' });
      if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

      const directory = await unzipper.Open.file(file.path);
      for (const entry of directory.files) {
        if (entry.type !== 'File') continue;
        const name = path.basename(String(entry.path).replace(/\\/g, '/'));
        if (!name || name.startsWith('.') || name === 'Thumbs.db') continue;
        if (!SAFE_MEDIA_NAME.test(name)) { report.rejected.push({ name, reason: 'unsupported file name' }); continue; }
        if (!MEDIA_EXTENSIONS.has(path.extname(name).slice(1).toLowerCase())) { report.rejected.push({ name, reason: 'not an audio/image file' }); continue; }

        const target = path.join(MEDIA_DIR, name);
        const exists = fs.existsSync(target);
        if (exists && !overwrite) { report.skipped.push(name); continue; }

        await new Promise((resolve, reject) => {
          entry.stream().pipe(fs.createWriteStream(target)).on('finish', resolve).on('error', reject);
        });
        (exists ? report.replaced : report.added).push(name);
      }
      res.json(report);
    } catch (err) {
      console.error('[data/media/import]', err);
      res.status(400).json({ error: `Could not read the zip file: ${err.message}`, partial: report });
    } finally {
      fs.unlink(file.path, () => {});
    }
  });

  return router;
};
