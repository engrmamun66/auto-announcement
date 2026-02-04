<template>
  <Rightbar
    ref="RightbarRef"
    v-if="showRightbar"
    title="Clone Students"
    @unmount="showRightbar = false; $emit('unmount')"
    :largestMode="false"
  >
    <div class="row g-3">
      <div class="col-12 col-md-4">
        <label for="">Mode</label>
        <select v-model="payload.mode" class="form-control cb-input">
          <option value="concat_after">Concat After</option>
          <option value="concat_before">Concat Before</option>
          <option value="add_with">Add With</option>
        </select>
      </div>

      <div class="col-12 col-md-4">
        <label for="">Adjustment Dakhela</label>
        <input v-model.number="payload.adjustment_dakhela" type="number" class="form-control cb-input" placeholder="e.g. 500" />
      </div>

      <div class="col-12 col-md-4">
        <label for="">Class Filter</label>
        <select v-model="payload.class_short" class="form-control cb-input">
          <option :value="null">All Classes</option>
          <template v-for="(cls, index) in classes" :key="index">
            <option :value="cls.class_short">{{ cls.class_name }}</option>
          </template>
        </select>
      </div>

      <div class="col-12">
        <div class="d-flex flex-wrap gap-2">
          <Btn class="white">Total: <span class="badge text-white bg-secondary">{{ summary.total }}</span></Btn>
          <Btn class="white">Ready: <span class="badge text-white bg-success">{{ summary.ok }}</span></Btn>
          <Btn class="white">No Sound: <span class="badge text-white bg-warning">{{ summary.no_sound }}</span></Btn>
          <Btn class="white">Exists: <span class="badge text-white bg-danger">{{ summary.exists }}</span></Btn>
          <Btn class="white">Duplicate: <span class="badge text-white bg-danger">{{ summary.duplicate }}</span></Btn>
          <Btn class="white">Invalid: <span class="badge text-white bg-danger">{{ summary.invalid }}</span></Btn>
        </div>
        <div v-if="setupError" class="text-danger small mt-2">
          {{ setupError }}
        </div>
      </div>

      <div class="col-12" v-if="planItems.length">
        <div class="table-responsive small">
          <table class="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Original</th>
                <th>Old Dakhela</th>
                <th>New Dakhela</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in previewItems" :key="'clone-prev-' + idx">
                <td>{{ idx + 1 }}</td>
                <td>
                  <div class="fw-semibold">{{ item.student?.name?.split('||')[0] }}</div>
                  <div class="text-muted">{{ item.student?.dakhela }} ({{ item.student?.class_short }})</div>
                </td>
                <td>{{ item.student?.dakhela ?? '-' }}</td>
                <td>{{ item.newDakhela ?? '-' }}</td>
                <td>
                  <span v-if="item.status === 'ok'" class="badge bg-success">Ready</span>
                  <span v-else-if="item.status === 'no_sound'" class="badge bg-warning">No Sound</span>
                  <span v-else-if="item.status === 'exists'" class="badge bg-danger">Exists</span>
                  <span v-else-if="item.status === 'duplicate'" class="badge bg-danger">Duplicate</span>
                  <span v-else class="badge bg-danger">Invalid</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-muted small">Showing first {{ previewItems.length }} items.</div>
        </div>
      </div>
      <div class="col-12" v-else>
        <div class="text-muted small">No students found.</div>
      </div>

      <div class="col-12" v-if="errorItems.length">
        <div class="alert alert-danger small">
          <div class="fw-semibold">Errors</div>
          <div v-for="(item, idx) in errorItems" :key="'err-' + idx">
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-between align-items-center pt-3">
        <div class="text-muted small" v-if="cloning">
          Cloning {{ progress.done }} / {{ progress.total }} (Skipped {{ progress.skipped }}, Failed {{ progress.failed }})
        </div>
        <div class="d-flex gap-2">
          <Btn class="red" @click.stop="resetErrors" :disabled="cloning || !errorItems.length">Clear Errors</Btn>
          <Btn @click.stop="startClone" :disabled="cloning || summary.ok === 0 || !!setupError">
            <template v-if="cloning">Cloning...</template>
            <template v-else>Clone Now</template>
            <BtnLoader v-if="cloning"></BtnLoader>
          </Btn>
        </div>
      </div>
    </template>
  </Rightbar>
</template>

<script setup>
import { ref, reactive, inject, computed, watch } from 'vue'
import Rightbar from './Rightbar.vue'
import Btn from './Btn.vue'
import BtnLoader from './BtnLoader.vue'

const http = inject('http')
const emitter = inject('emitter')
const classes = inject('classes', [])
const all_students = inject('all_students', [])
const all_students_non_copied = inject('all_students_non_copied', [])
const getAllStudents = inject('getAllStudents', () => {})

const emit = defineEmits(['unmount', 'refresh'])

const showRightbar = ref(true)
const cloning = ref(false)
const errorItems = ref([])
const progress = reactive({ total: 0, done: 0, skipped: 0, failed: 0 })

const payload = reactive({
  mode: 'concat_after',
  adjustment_dakhela: null,
  class_short: null,
})

const sourceStudents = computed(() => {
  let list = (all_students_non_copied.value || []).filter(Boolean)
  if (payload.class_short) {
    list = list.filter((s) => s.class_short === payload.class_short)
  }
  return list.slice().sort((a, b) => Number(a.dakhela) - Number(b.dakhela))
})

const existingDakhelas = computed(() => {
  const set = new Set()
  ;(all_students.value || []).forEach((s) => {
    if (s?.dakhela !== undefined && s?.dakhela !== null) {
      set.add(String(s.dakhela))
    }
  })
  return set
})

const setupError = computed(() => {
  const adjustment = Number(payload.adjustment_dakhela)
  if (!Number.isFinite(adjustment)) return 'Adjustment dakhela is required.'
  return ''
})

const planItems = computed(() => {
  const items = []
  const planned = new Set()
  const adjustment = Number(payload.adjustment_dakhela)
  const mode = payload.mode

  sourceStudents.value.forEach((student) => {
    let status = 'ok'
    let newDakhela = null

    if (!student?.sound1) {
      status = 'no_sound'
    } else {
      if (!Number.isFinite(adjustment)) {
        status = 'invalid'
      } else if (mode === 'concat_before') {
        newDakhela = Number(`${adjustment}${student?.dakhela}`)
      } else if (mode === 'concat_after') {
        newDakhela = Number(`${student?.dakhela}${adjustment}`)
      } else if (mode === 'add_with') {
        newDakhela = Number(student?.dakhela) + adjustment
      } else {
        status = 'invalid'
      }
    }

    if (status === 'ok') {
      if (!Number.isFinite(newDakhela) || newDakhela <= 0) {
        status = 'invalid'
      } else {
        const key = String(newDakhela)
        if (planned.has(key)) {
          status = 'duplicate'
        } else if (existingDakhelas.value.has(key)) {
          status = 'exists'
        } else {
          planned.add(key)
        }
      }
    }

    items.push({ student, newDakhela, status })
  })

  return items
})

const summary = computed(() => {
  const base = { total: 0, ok: 0, no_sound: 0, exists: 0, duplicate: 0, invalid: 0 }
  planItems.value.forEach((item) => {
    base.total += 1
    if (item.status === 'ok') base.ok += 1
    else if (item.status === 'no_sound') base.no_sound += 1
    else if (item.status === 'exists') base.exists += 1
    else if (item.status === 'duplicate') base.duplicate += 1
    else base.invalid += 1
  })
  return base
})

const previewItems = computed(() => planItems.value.slice(0, 50))

watch([() => payload.mode, () => payload.adjustment_dakhela, () => payload.class_short], () => {
  resetErrors()
})

function resetErrors() {
  errorItems.value = []
}

async function startClone() {
  if (cloning.value) return
  if (setupError.value) {
    emitter?.emit?.('toaster-warning', { message: setupError.value })
    return
  }

  const items = planItems.value.filter((item) => item.status === 'ok')
  if (!items.length) {
    emitter?.emit?.('toaster-warning', { message: 'No students to clone.' })
    return
  }

  if (!confirm(`Clone ${items.length} students?`)) return

  cloning.value = true
  progress.total = items.length
  progress.done = 0
  progress.skipped = summary.value.no_sound + summary.value.exists + summary.value.duplicate + summary.value.invalid
  progress.failed = 0
  resetErrors()

  for (const item of items) {
    try {
      await http.post(`/students/clone/${item.student.id}`, {
        dakhela: item.student.dakhela,
        dakhela_new: item.newDakhela,
      })
    } catch (error) {
      progress.failed += 1
      const message = error?.response?.data?.message || error?.message || 'Unknown error'
      errorItems.value.push(`[${item.student?.dakhela}] ${item.student?.name?.split('||')[0]} -> ${item.newDakhela}: ${message}`)
    } finally {
      progress.done += 1
    }
  }

  cloning.value = false

  if (progress.failed > 0) {
    emitter?.emit?.('toaster-error', { message: `Cloned with ${progress.failed} errors.` })
  } else {
    emitter?.emit?.('toaster-success', { message: `Cloned ${progress.total} students successfully.` })
  }

  await getAllStudents()
  emit('refresh')
}
</script>
