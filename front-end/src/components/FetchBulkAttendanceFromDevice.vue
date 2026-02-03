<template>
  <Rightbar
    ref="RightbarRef"
    v-if="showRightbar"
    title="Fetch Bulk Attendance"
    @unmount="showRightbar = false; $emit('unmount')"
    :largestMode="false"
  >
    <div class="alert alert-info small mb-2">
      <div><strong>এই টুলটি কী করে?</strong> ডিভাইস (BioTime) থেকে নির্দিষ্ট সময়ের পাঞ্চ লিস্ট এনে এখানে দেখায়।</div>
      <div><strong>কিভাবে ব্যবহার করবেন:</strong> Start/End সময় দিন → <b>Fetch Logs</b> চাপুন → তালিকা দেখে <b>Submit Attendance</b> দিন।</div>
      <!-- <div><strong>নোট:</strong> শুধু যেসব Emp Code আমাদের সিস্টেমে আছে সেগুলোই “Matched” হবে, বাকি গুলো “Skipped”.</div> -->
    </div>
    <div class="row g-3">
      <div class="col-6">
        <label for="">Start Time</label>
        <input v-model="payload.start_time" type="datetime-local" class="form-control cb-input" />
      </div>
      <div class="col-6">
        <label for="">End Time</label>
        <input v-model="payload.end_time" type="datetime-local" class="form-control cb-input" />
      </div>

      <div class="col-12">
        <div class="d-flex align-items-center gap-2">
          <Btn class="" @click.stop="fetchLogs" :disabled="fetching">
            <template v-if="fetching">Fetching...</template>
            <template v-else>Fetch Logs</template>
          </Btn>
          <Btn class="white">Total: <span class="badge text-white bg-secondary">{{ logs.length }}</span></Btn>
          <Btn class="white">Matched: <span class="badge text-white bg-success">{{ matchedCount }}</span></Btn>
          <Btn class="white">Skipped: <span class="badge text-white bg-danger">{{ skippedCount }}</span></Btn>
        </div>
      </div>

      <div class="col-12" v-if="logs.length">
        <div class="table-responsive small">
          <table class="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Punch Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in previewLogs" :key="'log-' + idx">
                <td>{{ item.emp_code }}</td>
                <td>{{ item.punch_time }}</td>
                <td>
                  <span v-if="hasStudent(item)" class="badge bg-success">Matched</span>
                  <span v-else class="badge bg-danger">Skipped</span>
                </td>
              </tr>
              <tr v-if="!previewLogs.length">
                <td colspan="3" class="text-center text-muted">No logs found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-between align-items-center pt-3">
        <div class="text-muted small" v-if="inserting">
          Importing {{ progress.done }} / {{ progress.total }} (Skipped {{ progress.skipped }})
        </div>
        <div class="d-flex gap-2">
          <Btn class="red" @click.stop="clearLogs" :disabled="fetching || inserting">Clear</Btn>
          <Btn @click.stop="submitLogs" :disabled="!logs.length || inserting">
            <template v-if="inserting">Submitting...</template>
            <template v-else>Submit Attendance</template>
          </Btn>
        </div>
      </div>
    </template>
  </Rightbar>
</template>

<script setup>
import moment from 'moment/moment'
import { ref, reactive, inject, computed, onMounted } from 'vue'
import Rightbar from './Rightbar.vue'
import Btn from './Btn.vue'

const http = inject('http')
const emitter = inject('emitter')
const all_students_non_copied = inject('all_students_non_copied')
const makeCarcode = inject('makeCarcode')
const punchToSubmitAttendance = inject('punchToSubmitAttendance')

defineEmits(['unmount'])

const showRightbar = ref(true)
const fetching = ref(false)
const inserting = ref(false)
const logs = ref([])
const progress = reactive({ total: 0, done: 0, skipped: 0 })

const payload = reactive({
  start_time: '',
  end_time: '',
})

const studentsMap = computed(() => {
  const map = new Map();
  (all_students_non_copied.value || []).forEach((s) => {
    map.set(String(s.dakhela), s)
  })
  return map
})

const previewLogs = computed(() => logs.value.slice(0, 50))
const matchedCount = computed(() => logs.value.filter((l) => hasStudent(l)).length)
const skippedCount = computed(() => logs.value.length - matchedCount.value)

function hasStudent(item){
  return studentsMap.value.has(String(item?.emp_code))
}

function formatForApi(dt){
  if (!dt) return ''
  return moment(dt).format('YYYY-MM-DD HH:mm:ss')
}

async function fetchLogs(){
  if (!payload.start_time || !payload.end_time) {
    return emitter?.emit?.('toaster-error', { message: 'Start and end time required.' })
  }
  fetching.value = true
  try {
    const params = {
      start_time: formatForApi(payload.start_time),
      end_time: formatForApi(payload.end_time),
    }
    const response = await http.get('/get-bulk-punched', { params })
    if (response.status === 200) {
      const data = response.data?.data || []
      logs.value = data.sort((a, b) => new Date(a.punch_time) - new Date(b.punch_time))
    }
  } catch (error) {
    console.warn('fetchLogs_error', error)
    emitter?.emit?.('toaster-error', { message: 'Failed to fetch logs.' })
  } finally {
    fetching.value = false
  }
}

function clearLogs(){
  logs.value = []
  progress.total = 0
  progress.done = 0
  progress.skipped = 0
}

async function submitLogs(){
  if (!logs.value.length) return
  if (!confirm(`Are you sure to submit ${logs.value.length} logs?`)) return

  inserting.value = true
  progress.total = logs.value.length
  progress.done = 0
  progress.skipped = 0

  for (const item of logs.value) {
    const student = studentsMap.value.get(String(item?.emp_code))
    if (!student) {
      progress.skipped += 1
      progress.done += 1
      continue
    }
    const barcode = makeCarcode(student)
    await punchToSubmitAttendance(barcode, {
      source: 'device',
      punch_time: item.punch_time,
      remarks: 'bulk_device_fetch',
      device_index: 0,
    })
    progress.done += 1
  }

  inserting.value = false
  emitter?.emit?.('toaster-success', { message: 'Bulk attendance submitted.' })
}

onMounted(() => {
  payload.start_time = moment().startOf('day').format('YYYY-MM-DDTHH:mm')
  payload.end_time = moment().format('YYYY-MM-DDTHH:mm')
})
</script>
