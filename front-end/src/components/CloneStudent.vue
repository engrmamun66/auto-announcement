<script setup>
import { ref, watch, inject } from 'vue'
import Modal from './modal.vue'
import Btn from './Btn.vue'
import BtnLoader from './BtnLoader.vue'
import BaseSelectMultiple from './BaseSelectMultiple.vue'

const props = defineProps({
  modelValue: Boolean,
  student: Object,
  devices: Array,
})

const emit = defineEmits([
  'update:modelValue',
  'clone-success',
])

const helper = inject('helper')
const emitter = inject('emitter')
const http = inject('http')

const newDakhela = ref(null)
const selectedDevices = ref([])
const isCloning = ref(false)
const errorMessage = ref('')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    newDakhela.value = null
    errorMessage.value = ''
    selectedDevices.value = props.devices || []
  }
})

function handleClose() {
  emit('update:modelValue', false)
}

async function handleClone() {
  if (!newDakhela.value) {
    errorMessage.value = helper.t('Please enter dakhela number')
    return
  }

  isCloning.value = true
  errorMessage.value = ''

  try {
    const response = await http.post(`/students/clone/${props.student?.id}`, {
      dakhela_new: newDakhela.value,
    })

    if (response.status === 200) {
      let successCount = 0
      const newStudent = response.data?.data || response.data

      if (selectedDevices.value?.length && newStudent?.dakhela) {
        try {
          const userData = {
            pin: newStudent.dakhela,
            name: newStudent.name,
            card: newStudent.card_no || '',
            privilege: 0,
          }

          for (const device of selectedDevices.value) {
            const deviceSn = typeof device === 'object' ? device.serial_number : device
            const devResponse = await fetch(`/${deviceSn}/add-user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            })
            if (devResponse.ok) successCount++
          }

          if (successCount === selectedDevices.value.length) {
            emitter.emit('toaster-success', {
              message: helper.t('Student cloned and added to {count} device(s)', {
                count: selectedDevices.value.length,
              }),
            })
          } else {
            emitter.emit('toaster-warning', {
              message: helper.t('Student cloned but added to {count} of {total} device(s)', {
                count: successCount,
                total: selectedDevices.value.length,
              }),
            })
          }
        } catch (deviceError) {
          emitter.emit('toaster-warning', {
            message: helper.t('Student cloned but failed to add to devices'),
          })
        }
      } else if (!selectedDevices.value?.length) {
        emitter.emit('toaster-success', {
          message: helper.t('Student cloned successfully'),
        })
      }

      emit('clone-success')
      handleClose()
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || helper.t('Clone failed')
    emitter.emit('toaster-error', { message: errorMessage.value })
  } finally {
    isCloning.value = false
  }
}
</script>

<template>
  <modal
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    @close="handleClose"
    :title="helper.t('Clone Student')"
    width="500px"
    :close-on-esc="true"
    :close-on-click-away="true"
  >
    <div class="w-100">
      <div class="cb-form">
        <div @click.stop="false">
          <div class="row g-2 mt-2">
            <!-- Original Student Info -->
            <div class="col-12">
              <div class="form-group">
                <label>{{ helper.t('Source Student') }}</label>
                <input
                  type="text"
                  class="form-control cb-input cb-input--sm"
                  :value="`${student?.name} (${student?.dakhela})`"
                  disabled
                />
              </div>
            </div>

            <!-- New Dakhela -->
            <div class="col-12">
              <div class="form-group">
                <label>{{ helper.t('New Dakhela') }} <sup>*</sup></label>
                <input
                  v-model="newDakhela"
                  type="number"
                  class="form-control cb-input cb-input--sm"
                  :placeholder="helper.t('Enter new dakhela')"
                  autofocus
                />
              </div>
            </div>

            <!-- Device Selection -->
            <template v-if="devices?.length">
              <div class="col-12">
                <div class="form-group">
                  <label>{{ helper.t('Select Devices') }}</label>
                  <BaseSelectMultiple
                    :modelValue="selectedDevices"
                    @update:modelValue="(val) => (selectedDevices = val)"
                    :data="devices"
                    displayKey="name"
                    displayKey2="serial_number"
                    valueKey="serial_number"
                    :limit="999"
                    placeholder="No devices selected"
                  />
                </div>
              </div>
            </template>

            <!-- Error Message -->
            <div v-if="errorMessage" class="col-12">
              <p class="text-danger mb-0">{{ errorMessage }}</p>
            </div>

            <!-- Buttons -->
            <div class="col-12 d-flex justify-content-center mt-3">
              <Btn @click="handleClose" class="red me-2">{{ helper.t('Cancel') }}</Btn>
              <Btn @click="handleClone" addStudentAttr class="me-0" :disabled="isCloning || !newDakhela">
                {{ helper.t('Clone') }} <BtnLoader v-if="isCloning"></BtnLoader>
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<style scoped>
.cb-form .form-group {
  margin-bottom: 0;
}
.cb-form label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #555;
  display: block;
}
.cb-input--sm {
  height: 34px !important;
  font-size: 13px !important;
  padding: 4px 10px !important;
}
</style>
