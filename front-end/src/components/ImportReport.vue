<script setup>
// Import result shown in the Rightbar after an Excel import (see pages/Import.vue)
import { computed, inject } from 'vue'

const props = defineProps({
  report: { type: Object, default: () => ({}) }, // { settings?, students? (with .schedules), attendance? }
})

const helper = inject('helper')

const settings = computed(() => props.report?.settings || null)
const attendance = computed(() => props.report?.attendance || null)
const students = computed(() => props.report?.students || null)
const studentRows = computed(() => students.value?.students || [])
const scheduleRows = computed(() => students.value?.schedules || [])
const showStudents = computed(() => studentRows.value.length || students.value?.total)

const STATUS_LABEL = {
  created: 'Created',
  updated: 'Updated',
  skipped: 'Skipped',
  error: 'Error',
  not_found: 'Not Found',
}
const statusLabel = (s) => helper.t(STATUS_LABEL[s] || s)

// "Name (Copied)||dakhela::101" -> name + main dakhela
const displayName = (name) => String(name || '').split('||')[0]
const mainDakhela = (name) => (String(name || '').match(/dakhela::(\d+)/) || [])[1] || ''

const countBy = (rows, status) => rows.filter(r => r.status === status).length
const scheduleStats = computed(() => ({
  created: countBy(scheduleRows.value, 'created'),
  updated: countBy(scheduleRows.value, 'updated'),
  skipped: countBy(scheduleRows.value, 'skipped'),
  error: countBy(scheduleRows.value, 'error'),
}))
</script>

<template>
  <div class="ir">
    <!-- Settings -->
    <section v-if="settings" class="ir-card">
      <header class="ir-card__head">
        <span class="ir-card__icon ir-card__icon--settings"><i class='bx bxs-cog'></i></span>
        <h6>{{ helper.t('Settings') }}</h6>
        <span class="ir-card__meta">{{ settings.updated?.length || 0 }} {{ helper.t('Updated') }}</span>
      </header>
      <div v-if="settings.updated?.length" class="ir-keys">
        <span v-for="key in settings.updated" :key="key" class="ir-key"><i class='bx bx-check'></i> {{ key }}</span>
      </div>
      <p v-else class="ir-empty">{{ helper.t('Nothing updated') }}</p>
      <ul v-if="settings.skipped?.length" class="ir-issues">
        <li v-for="row in settings.skipped" :key="row.key"><strong>{{ row.key }}</strong> — {{ row.reason }}</li>
      </ul>
    </section>

    <!-- Attendance -->
    <section v-if="attendance" class="ir-card">
      <header class="ir-card__head">
        <span class="ir-card__icon ir-card__icon--attendance"><i class='bx bx-user-pin'></i></span>
        <h6>{{ helper.t('Attendance') }}</h6>
        <span class="ir-card__meta">{{ helper.t('Total') }}: {{ attendance.total }}</span>
      </header>
      <div class="ir-stats">
        <div class="ir-stat is-created"><b>{{ attendance.created }}</b><span>{{ helper.t('Created') }}</span></div>
        <div class="ir-stat is-updated"><b>{{ attendance.updated }}</b><span>{{ helper.t('Updated') }}</span></div>
        <div class="ir-stat is-skipped"><b>{{ attendance.skipped }}</b><span>{{ helper.t('Skipped') }}</span></div>
        <div class="ir-stat is-error"><b>{{ attendance.errors }}</b><span>{{ helper.t('Errors') }}</span></div>
      </div>
      <ul v-if="attendance.issues?.length" class="ir-issues">
        <li v-for="row in attendance.issues" :key="row.excelRow">
          {{ helper.t('Row') }} {{ row.excelRow }}: {{ row.student_id }} / {{ row.date }} — {{ row.reason }}
        </li>
      </ul>
    </section>

    <!-- Schedules -->
    <section v-if="scheduleRows.length" class="ir-card">
      <header class="ir-card__head">
        <span class="ir-card__icon ir-card__icon--schedules"><i class='bx bxs-calendar'></i></span>
        <h6>{{ helper.t('Schedules') }}</h6>
        <span class="ir-card__meta">{{ helper.t('Total') }}: {{ scheduleRows.length }}</span>
      </header>
      <div class="ir-stats">
        <div class="ir-stat is-created"><b>{{ scheduleStats.created }}</b><span>{{ helper.t('Created') }}</span></div>
        <div class="ir-stat is-updated"><b>{{ scheduleStats.updated }}</b><span>{{ helper.t('Updated') }}</span></div>
        <div class="ir-stat is-skipped"><b>{{ scheduleStats.skipped }}</b><span>{{ helper.t('Skipped') }}</span></div>
        <div class="ir-stat is-error"><b>{{ scheduleStats.error }}</b><span>{{ helper.t('Errors') }}</span></div>
      </div>
      <div class="ir-table-wrap">
        <table class="ir-table">
          <thead>
            <tr><th>{{ helper.t('Row') }}</th><th>{{ helper.t('Title') }}</th><th>{{ helper.t('Status') }}</th><th>{{ helper.t('Reason') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in scheduleRows" :key="row.excelRow">
              <td class="ir-muted">{{ row.excelRow }}</td>
              <td class="ir-strong">{{ row.title }}</td>
              <td><span class="ir-pill" :class="'is-' + row.status">{{ statusLabel(row.status) }}</span></td>
              <td class="ir-muted">{{ row.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Students -->
    <section v-if="showStudents" class="ir-card">
      <header class="ir-card__head">
        <span class="ir-card__icon ir-card__icon--students"><i class='bx bxs-user'></i></span>
        <h6>{{ helper.t('Students') }}</h6>
        <span class="ir-card__meta">{{ helper.t('Total') }}: {{ studentRows.length }}</span>
      </header>
      <div class="ir-stats ir-stats--5">
        <div class="ir-stat is-created"><b>{{ students.created ?? 0 }}</b><span>{{ helper.t('Created') }}</span></div>
        <div class="ir-stat is-updated"><b>{{ students.updated ?? 0 }}</b><span>{{ helper.t('Updated') }}</span></div>
        <div class="ir-stat is-not_found"><b>{{ students.not_found ?? 0 }}</b><span>{{ helper.t('Not Found') }}</span></div>
        <div class="ir-stat is-skipped"><b>{{ students.skipped ?? 0 }}</b><span>{{ helper.t('Skipped') }}</span></div>
        <div class="ir-stat is-error"><b>{{ students.errors ?? 0 }}</b><span>{{ helper.t('Errors') }}</span></div>
      </div>
      <div class="ir-table-wrap ir-table-wrap--tall">
        <table class="ir-table">
          <thead>
            <tr>
              <th>{{ helper.t('Row') }}</th>
              <th>{{ helper.t('Name') }}</th>
              <th>{{ helper.t('Dakhela') }}</th>
              <th>{{ helper.t('Class') }}</th>
              <th>{{ helper.t('Status') }}</th>
              <th>{{ helper.t('Reason') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in studentRows" :key="row.excelRow">
              <td class="ir-muted">{{ row.excelRow }}</td>
              <td class="ir-strong">
                {{ displayName(row.name) }}
                <span v-if="mainDakhela(row.name)" class="ir-tag">main {{ mainDakhela(row.name) }}</span>
              </td>
              <td>{{ row.dakhela }}</td>
              <td>{{ row.class }}</td>
              <td><span class="ir-pill" :class="'is-' + row.status">{{ statusLabel(row.status) }}</span></td>
              <td class="ir-muted">{{ row.reason }}</td>
            </tr>
            <tr v-if="!studentRows.length">
              <td colspan="6" class="ir-empty text-center">{{ helper.t('No rows to show') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="!settings && !attendance && !scheduleRows.length && !showStudents" class="ir-empty text-center">{{ helper.t('No rows to show') }}</p>
  </div>
</template>

<style scoped>
.ir{ display: flex; flex-direction: column; gap: 14px; font-size: 14px; color: #1f2937; }

.ir-card{
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.ir-card__head{ display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ir-card__head h6{ margin: 0; font-size: 15px; font-weight: 700; }
.ir-card__meta{ margin-left: auto; font-size: 12px; color: #64748b; font-weight: 600; }
.ir-card__icon{
  width: 30px; height: 30px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center; font-size: 17px;
}
.ir-card__icon--settings{ background: #ede9fe; color: #6d28d9; }
.ir-card__icon--attendance{ background: #e0f2fe; color: #0369a1; }
.ir-card__icon--schedules{ background: #fef3c7; color: #b45309; }
.ir-card__icon--students{ background: #dcfce7; color: #15803d; }

/* Stat tiles */
.ir-stats{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.ir-stats--5{ grid-template-columns: repeat(5, minmax(0, 1fr)); }
.ir-stat{
  --c: #64748b; --bg: #f1f5f9;
  display: flex; flex-direction: column; align-items: flex-start;
  padding: 8px 10px; border-radius: 10px; background: var(--bg);
  border-left: 3px solid var(--c);
}
.ir-stat b{ font-size: 20px; line-height: 1.1; color: var(--c); font-variant-numeric: tabular-nums; }
.ir-stat span{ font-size: 11px; font-weight: 600; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.ir-stat.is-created{ --c: #16a34a; --bg: #f0fdf4; }
.ir-stat.is-updated{ --c: #2563eb; --bg: #eff6ff; }
.ir-stat.is-not_found{ --c: #d97706; --bg: #fffbeb; }
.ir-stat.is-skipped{ --c: #64748b; --bg: #f8fafc; }
.ir-stat.is-error{ --c: #dc2626; --bg: #fef2f2; }

/* Settings keys */
.ir-keys{ display: flex; flex-wrap: wrap; gap: 6px; }
.ir-key{
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  color: #166534; background: #dcfce7; border: 1px solid #bbf7d0;
}

/* Tables */
.ir-table-wrap{ margin-top: 12px; max-height: 260px; overflow: auto; border: 1px solid #eef2f7; border-radius: 10px; }
.ir-table-wrap--tall{ max-height: 52vh; }
.ir-table{ width: 100%; border-collapse: collapse; font-size: 13px; }
.ir-table th{
  position: sticky; top: 0; z-index: 1;
  background: #f8fafc; color: #64748b;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;
  text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;
}
.ir-table td{ padding: 7px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.ir-table tbody tr:hover td{ background: #f8fafc; }
.ir-strong{ font-weight: 600; color: #0f172a; }
.ir-muted{ color: #64748b; font-size: 12px; }
.ir-tag{ margin-left: 6px; padding: 0 6px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #475569; background: #f1f5f9; white-space: nowrap; }

/* Status pills */
.ir-pill{
  display: inline-block; padding: 1px 9px; border-radius: 999px;
  font-size: 11px; font-weight: 700; white-space: nowrap;
  color: #475569; background: #f1f5f9;
}
.ir-pill.is-created{ color: #15803d; background: #dcfce7; }
.ir-pill.is-updated{ color: #1d4ed8; background: #dbeafe; }
.ir-pill.is-not_found{ color: #b45309; background: #fef3c7; }
.ir-pill.is-error{ color: #b91c1c; background: #fee2e2; }

.ir-issues{ margin: 10px 0 0; padding-left: 18px; font-size: 12px; color: #64748b; }
.ir-issues li{ margin-bottom: 2px; }
.ir-empty{ margin: 0; font-size: 13px; color: #94a3b8; }

@media (max-width: 600px){
  .ir-stats, .ir-stats--5{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
