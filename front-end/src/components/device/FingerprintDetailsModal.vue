<script setup>
import { ref, inject, watch } from 'vue'
import Modal from '../modal.vue'

const props = defineProps({
  modelValue: Boolean,
  device: {
    type: Object,
    default: null
  },
  pin: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const helper = inject('helper')
const emitter = inject('emitter')

const fingerprints = ref([])
const loading = ref(false)

async function fetchFingerprintDetails() {
  if (!props.device || !props.pin) return

  loading.value = true
  try {
    const response = await fetch(`/${props.device.serial_number}/get-fingerprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()

    // Filter fingerprints by PIN and limit to 10
    const userFingerprints = (data.fingerprints || [])
      .filter(fp => String(fp['FP PIN'] || fp.PIN) === String(props.pin))
      .slice(0, 10)

    fingerprints.value = userFingerprints
    console.log(`Fetched ${userFingerprints.length} fingerprints for PIN ${props.pin}`)
  } catch (err) {
    console.error('Fetch fingerprint details error:', err)
    emitter.emit('toaster-error', { message: 'Failed to fetch fingerprint details' })
  } finally {
    loading.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fingerprints.value = []
    fetchFingerprintDetails()
  }
})
</script>

<template>
  <Modal
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    @close="handleClose"
    :title="`Fingerprints - ${userName || 'User'} (PIN: ${pin})`"
    width="600px"
    :close-on-esc="true"
    :close-on-click-away="true"
  >
    <div class="fingerprints-content">
      <div v-if="loading" class="loading-state">
        <p>{{ helper.t('Loading...') }}</p>
      </div>

      <div v-else-if="fingerprints.length === 0" class="empty-state">
        <p>{{ helper.t('No fingerprints found') }}</p>
      </div>

      <div v-else class="fingerprints-list">
        <div class="fingerprints-header">
          <span class="badge">{{ fingerprints.length }} {{ helper.t('Fingerprints') }}</span>
        </div>

        <div class="fingerprint-item" v-for="(fp, idx) in fingerprints" :key="idx">
          <div class="fp-info">
            <div class="fp-row">
              <span class="fp-label">{{ helper.t('Finger ID') }}:</span>
              <span class="fp-value">{{ fp.FID || fp.fid || '-' }}</span>
            </div>
            <div class="fp-row">
              <span class="fp-label">{{ helper.t('Size') }}:</span>
              <span class="fp-value">{{ fp.Size || fp.size || '-' }} {{ helper.t('bytes') }}</span>
            </div>
            <div class="fp-row">
              <span class="fp-label">{{ helper.t('Valid') }}:</span>
              <span class="fp-value">
                <span v-if="fp.Valid || fp.valid" class="status-valid">✓ Valid</span>
                <span v-else class="status-invalid">✗ Invalid</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.fingerprints-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.fingerprints-header {
  display: flex;
  gap: 12px;
  padding: 0 4px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
}

.fingerprints-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.fingerprint-item {
  padding: 16px;
  background: #f9f9fb;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.2s;
}

.fingerprint-item:hover {
  background: #ffffff;
  border-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.fp-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fp-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.fp-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.fp-value {
  color: #555;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.status-valid {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #c8e6c9;
  color: #2e7d32;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.status-invalid {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #ffcdd2;
  color: #c62828;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

@media (max-width: 768px) {
  .fingerprints-list {
    max-height: 400px;
  }

  .fp-row {
    flex-direction: column;
    gap: 4px;
  }

  .fp-label {
    min-width: unset;
  }
}
</style>
