<script setup>
import { ref, reactive, watch, onBeforeUnmount, inject } from 'vue'
import moment from 'moment/moment'
import Modal from './modal.vue'
import Tabset from './Tabset.vue'
import Btn from './Btn.vue'
import BtnLoader from './BtnLoader.vue'
import AudioUpload from './AudioUpload.vue'
import AudioRecorAndUpload from './AudioRecorAndUpload.vue'
import BaseSelectMultiple from './BaseSelectMultiple.vue'

const props = defineProps({
  modelValue: Boolean,
  payload: Object,
  editModeTabIndex: Number,
  classes: Array,
  profileImagePreview: String,
  profileImageFile: Object,
  devices: Array,
  selectedDevices: Array,
  isAdding: Boolean,
  studentLogs: Array,
  appAccessData: Object,
  CONFIG: Object,
  students: Array,
})

const emit = defineEmits([
  'update:modelValue',
  'update:editModeTabIndex',
  'update:selectedDevices',
  'add-student',
  'update-student',
  'get-punch-logs',
  'delete-audio',
  'profile-image-change',
  'clear-payload'
])

const helper = inject('helper')
const emitter = inject('emitter')

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    emit('clear-payload')
  }
})

function handleClose() {
  emit('update:modelValue', false)
}

function handleTabChange(tab) {
  emit('update:editModeTabIndex', tab)
  if (tab == 2) {
    emit('get-punch-logs')
  }
}

function handleProfileImageChange(event) {
  emit('profile-image-change', event)
}

function handleDeleteAudio(std, colName) {
  emit('delete-audio', { std, colName })
}

async function handleAddStudent() {
  emit('add-student')
}

async function handleUpdateStudent() {
  emit('update-student')
}
</script>

<template>
  <modal :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)" @close="handleClose" :title="!payload?.id ? helper.t('Add Student') : (editModeTabIndex == 1 ? helper.t('Update Student') : helper.t('Guardian Punch History'))" :width="editModeTabIndex == 2 ? '700px' : '500px'" :close-on-esc="true" :close-on-click-away="true">
    <div class="w-100">
      <div class="cb-form">
        <div @click.stop="false">
          <div class="row g-2" :class="[payload?.id ? 'mt-1' : 'mt-2']">

            <div class="col-12 d-flex justify-content-between align-items-center">
              <Tabset v-if="payload?.id" @onTab="handleTabChange"></Tabset>
              <label class="using-card-title-in-form" v-if="CONFIG?.settings?.attendance?.status && payload?.id && payload?.name">
                {{ String(payload?.name).indexOf('Copied') > -1 ? helper.t('This card for guardian') : helper.t('This card for student') }}
              </label>
            </div>

            <template v-if="editModeTabIndex == 1">

              <!-- Class + Year -->
              <div class="col-8">
                <div class="form-group">
                  <label>{{ helper.t('Class') }} <sup>*</sup></label>
                  <select v-model="payload.class" class="form-control cb-input cb-input--sm" id="ClassId" :disabled="payload?.id && payload.name && payload.name.indexOf('||dakhela') > -1">
                    <option :value="null">-class-</option>
                    <template v-for="(cls, index) in classes" :key="index">
                      <option :value="cls.class_name">{{cls.class_name}}</option>
                    </template>
                  </select>
                </div>
              </div>
              <div class="col-4">
                <div class="form-group">
                  <label>{{ helper.t('Year') }} <sup>*</sup></label>
                  <select v-model="payload.year" class="form-control cb-input cb-input--sm" :disabled="payload?.id && payload.name && payload.name.indexOf('||dakhela') > -1">
                    <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
                    <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
                    <option :value="new Date().getFullYear() - 2">{{ new Date().getFullYear() - 2 }}</option>
                    <option :value="new Date().getFullYear() - 3">{{ new Date().getFullYear() - 3 }}</option>
                  </select>
                </div>
              </div>

              <!-- Name -->
              <div class="col-12">
                <div class="form-group">
                  <label>{{ helper.t('Name') }} <sup>*</sup></label>
                  <input v-model="payload.name" type="text" class="form-control cb-input cb-input--sm" :disabled="payload?.id && payload.name && payload.name.indexOf('||dakhela') > -1">
                </div>
              </div>

              <!-- Dakhela + Phone -->
              <div class="col-5">
                <div class="form-group">
                  <label>{{ helper.t('Dakhela') }} <sup>*</sup></label>
                  <input v-model="payload.dakhela" type="number" class="form-control cb-input cb-input--sm" :disabled="payload?.id && payload.name && payload.name.indexOf('||dakhela') > -1">
                </div>
              </div>
              <div class="col-7">
                <div class="form-group">
                  <label>{{ helper.t('Phone Number(11 Digit') }} <sup>*</sup></label>
                  <div class="position-relative">
                    <input v-model="payload.phone_number" type="text" class="form-control cb-input cb-input--sm" style="padding-right: 28px;">
                    <span class="phone-valid-icon" :class="{ 'text-success': /^01\d{9}$/.test(String(payload.phone_number).trim()), 'text-danger': !/^01\d{9}$/.test(String(payload.phone_number).trim()) }">
                      <i :class="{ 'bx bx-check-circle': /^01\d{9}$/.test(String(payload.phone_number).trim()), 'bx bx-x-circle': !/^01\d{9}$/.test(String(payload.phone_number).trim()) }"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Profile Image -->
              <div class="col-12">
                <div class="form-group">
                  <label>{{ helper.t('Profile Image') }}</label>
                  <div class="d-flex align-items-center gap-2">
                    <img class="profile-thumb" :src="profileImagePreview || payload.profile_image || '/default-profile-image.png'" alt="profile" />
                    <input v-model="payload.profile_image" type="text" class="form-control cb-input cb-input--sm" :placeholder="helper.t('Image URL or path')">
                    <label for="profile_image_input" class="cb-file-btn cb-input--sm">
                      <span>{{ helper.t('Choose Image') }}</span>
                      <input id="profile_image_input" type="file" accept="image/*" class="d-none" @change="handleProfileImageChange">
                    </label>
                  </div>
                </div>
              </div>

              <!-- Device Selection -->
              <template v-if="devices?.length">
                <!-- Card Number -->
                <div class="col-12">
                  <div class="form-group">
                    <label>{{ helper.t('Card Number') }}</label>
                    <input v-model="payload.card_no" type="text" class="form-control cb-input cb-input--sm" :placeholder="helper.t('Enter card number')">
                  </div>
                </div>

                <!-- Device Selection with Multi-Select -->
                <div class="col-12">
                  <div class="form-group">
                    <label>{{ helper.t('Select Devices') }}</label>
                    <BaseSelectMultiple
                      :modelValue="selectedDevices"
                      @update:modelValue="(val) => emit('update:selectedDevices', val)"
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

              <!-- Card Owner -->
              <template v-if="CONFIG?.settings?.attendance?.status">
                <div class="col-12 mt-3" v-if="CONFIG?.card_owners?.length">
                  <div class="form-group d-flex align-items-center gap-3">
                    <label class="mb-0">{{ helper.t('Card Owner') }}</label>
                    <div class="d-flex flex-wrap gap-2">
                      <template v-for="owner in CONFIG?.card_owners">
                        <div @click.stop="payload.card_owner = owner.id" class="d-flex justify-content-start each-owner-name">
                          <span :class="{'checked': payload.card_owner == owner.id}" customized-radio></span>
                          <label class="cp">{{ owner.name }}</label>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </template>

              <div class="col-12 d-flex justify-content-center mt-3">
                <Btn @click.stop="handleClose" class="red me-2">{{ helper.t('Cancel') }}</Btn>
                <Btn v-if="!payload.id" @click="handleAddStudent" addStudentAttr class="me-0">{{ helper.t('Submit') }} <BtnLoader v-if="isAdding"></BtnLoader></Btn>
                <Btn v-else @click="handleUpdateStudent" updateStudentAttr class="me-0" v-if="payload.name && payload.name.indexOf('||dakhela') === -1">{{ helper.t('Update') }} <BtnLoader v-if="isAdding"></BtnLoader></Btn>
              </div>
            </template>

            <template v-else-if="editModeTabIndex == 2">
              <div class="col-12 overflow-y-scroll">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Before</th>
                    </tr>
                  </thead>

                  <tbody>
                    <template v-if="studentLogs?.length">
                      <template v-for="(student, i) in studentLogs">
                        <tr>
                          <td>{{ student?.name }}</td>
                          <td>{{ helper.enToBnDate(moment(student?.punch_exact_time_text).format('DD MMMM, dddd')).replace(/ /g, '&nbsp;') }}</td>
                          <td>{{ helper.enToBnDate(moment(student?.punch_exact_time_text).format('hh:mm:ss&nbsp;A')) }}</td>
                          <td>{{ helper.enToBnDate(moment().diff(student?.punch_exact_time_text, 'days')) }} দিন</td>
                        </tr>
                      </template>
                    </template>
                    <template v-else>
                      <tr>
                        <td colspan="44">{{ helper.t('No log found') }}</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </template>

          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<style scoped>
.phone-valid-icon {
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  line-height: 1;
  pointer-events: none;
}
.overflow-y-scroll {
  max-height: calc(100vh - 390px);
  overflow-y: auto;
  padding-bottom: 15px;
}
@media (max-width: 500px) {
  .overflow-y-scroll {
    max-height: calc(100vh - 390px);
    overflow-y: auto;
  }
}
[customized-radio] {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 1px solid var(--primaryColor);
  background-color: white;
  cursor: pointer;
  margin-right: 5px;
  transform: translateY(3px);
}
[customized-radio].checked {
  border-color: var(--primaryColor);
  background: radial-gradient(circle, var(--primaryColor) 0%, var(--primaryColor) 30%, #e2e2e2 40%, transparent 100%);
}
.each-owner-name {
  padding: 3px 10px;
  background: #f0f0f0;
  border-radius: 32px;
  box-shadow: 0px 3px 0px #0000004f;
}
.using-card-title-in-form {
  padding: 5px 15px;
  border-radius: 15px;
  background: var(--grad1);
  border-color: var(--primaryColor);
}
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
.cb-file-btn {
  flex-shrink: 0;
  height: 34px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  background: #f8f9fa;
  color: #333;
}
.cb-file-btn:hover {
  background: #e9ecef;
}
.profile-thumb {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #cfcfcf;
  background: #fff;
}
</style>
