<script setup>
import { ref, inject, nextTick } from 'vue'
import moment from 'moment/moment'

const helper = inject('helper')
const emitter = inject('emitter')

const formData = ref({
  receiptNo: '',
  date: moment().format('YYYY-MM-DD'),
  receivedFrom: '',
  amount: '',
  paymentFor: '',
  currentBalance: '',
  paymentAmount: '',
  balanceDue: '',
  receivedFromSig: '',
  receivedBySig: '',
})

const showPreview = ref(false)
const receipts = ref([])
const receiptRef = ref(null)

function calculateBalanceDue() {
  const current = parseFloat(formData.value.currentBalance) || 0
  const payment = parseFloat(formData.value.paymentAmount) || 0
  formData.value.balanceDue = (current - payment).toFixed(2)
}

function syncAmount() {
  formData.value.paymentAmount = formData.value.amount
  calculateBalanceDue()
}

function validateForm() {
  if (!formData.value.receiptNo || !formData.value.receivedFrom || !formData.value.amount || !formData.value.paymentFor) {
    emitter.emit('toaster-error', { message: 'Please fill all required fields' })
    return false
  }
  return true
}

function generatePreview() {
  if (!validateForm()) return
  showPreview.value = true
}

async function saveReceipt() {
  if (!validateForm()) return
  const receipt = { ...formData.value, id: Date.now() }
  receipts.value.unshift(receipt)
  emitter.emit('toaster-success', { message: 'Receipt saved successfully' })
  resetForm()
}

function downloadReceipt() {
  window.print()
}

function printReceipt() {
  window.print()
}

function resetForm() {
  formData.value = {
    receiptNo: '',
    date: moment().format('YYYY-MM-DD'),
    receivedFrom: '',
    amount: '',
    paymentFor: '',
    currentBalance: '',
    paymentAmount: '',
    balanceDue: '',
    receivedFromSig: '',
    receivedBySig: '',
  }
  showPreview.value = false
}

function deleteReceipt(id) {
  receipts.value = receipts.value.filter(r => r.id !== id)
  emitter.emit('toaster-success', { message: 'Receipt deleted' })
}

function editReceipt(receipt) {
  formData.value = { ...receipt }
  receipts.value = receipts.value.filter(r => r.id !== receipt.id)
  showPreview.value = false
}
</script>

<template>
  <div class="receipt-page">
    <div v-if="!showPreview" class="form-section">
      <div class="form-header">
        <h1>{{ helper.t('Money Receipt Generator') }}</h1>
        <p>{{ helper.t('Create and manage receipts') }}</p>
      </div>

      <div class="receipt-bg-container">
        <div class="receipt-overlay">
          <form class="receipt-form" @submit.prevent="generatePreview">
            <!-- No. and Date -->
            <div class="field-wrapper pos-no">
              <input v-model="formData.receiptNo" type="text" placeholder="No." required>
            </div>
            <div class="field-wrapper pos-date">
              <input v-model="formData.date" type="date" required>
            </div>

            <!-- Received From -->
            <div class="field-wrapper pos-received-from">
              <input v-model="formData.receivedFrom" type="text" placeholder="Received From" required>
            </div>

            <!-- Amount -->
            <div class="field-wrapper pos-amount">
              <input v-model.number="formData.amount" type="number" placeholder="0.00" @change="syncAmount" required>
            </div>

            <!-- BDT Box -->
            <div class="field-wrapper pos-bdt">
              <input v-model="formData.amount" type="number" placeholder="0.00" disabled>
            </div>

            <!-- Payment For -->
            <div class="field-wrapper pos-payment-for">
              <input v-model="formData.paymentFor" type="text" placeholder="Payment For" required>
            </div>

            <!-- Current Balance -->
            <div class="field-wrapper pos-current-balance">
              <input v-model.number="formData.currentBalance" type="number" placeholder="0.00" @change="calculateBalanceDue">
            </div>

            <!-- Payment Amount -->
            <div class="field-wrapper pos-payment-amount">
              <input v-model.number="formData.paymentAmount" type="number" placeholder="0.00" @change="calculateBalanceDue">
            </div>

            <!-- Balance Due -->
            <div class="field-wrapper pos-balance-due">
              <input v-model.number="formData.balanceDue" type="number" placeholder="0.00" disabled>
            </div>

            <!-- Signatures -->
            <div class="field-wrapper pos-received-from-sig">
              <input v-model="formData.receivedFromSig" type="text" placeholder="Name">
            </div>
            <div class="field-wrapper pos-received-by-sig">
              <input v-model="formData.receivedBySig" type="text" placeholder="Name">
            </div>

            <!-- Hidden submit -->
            <button type="submit" style="display: none;"></button>
          </form>
        </div>
        <img src="/money-receipt.jpeg" alt="Receipt Template" class="receipt-image">
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" @click="generatePreview">{{ helper.t('Preview') }}</button>
        <button class="btn btn-success" @click="saveReceipt">{{ helper.t('Save') }}</button>
        <button class="btn btn-secondary" @click="resetForm">{{ helper.t('Reset') }}</button>
      </div>
    </div>

    <div v-else class="preview-section">
      <div class="preview-header">
        <button class="btn btn-secondary" @click="showPreview = false">{{ helper.t('← Back') }}</button>
        <div class="preview-title">{{ helper.t('Receipt Preview') }}</div>
        <div></div>
      </div>

      <div ref="receiptRef" class="receipt-preview-bg">
        <div class="receipt-preview-overlay">
          <div class="preview-field pos-no">{{ formData.receiptNo }}</div>
          <div class="preview-field pos-date">{{ moment(formData.date).format('DD-MM-YYYY') }}</div>
          <div class="preview-field pos-received-from">{{ formData.receivedFrom }}</div>
          <div class="preview-field pos-amount">{{ parseFloat(formData.amount || 0).toFixed(2) }}</div>
          <div class="preview-field pos-bdt">{{ parseFloat(formData.amount || 0).toFixed(2) }}</div>
          <div class="preview-field pos-payment-for">{{ formData.paymentFor }}</div>
          <div class="preview-field pos-current-balance">{{ parseFloat(formData.currentBalance || 0).toFixed(2) }}</div>
          <div class="preview-field pos-payment-amount">{{ parseFloat(formData.paymentAmount || 0).toFixed(2) }}</div>
          <div class="preview-field pos-balance-due">{{ parseFloat(formData.balanceDue || 0).toFixed(2) }}</div>
          <div class="preview-field pos-received-from-sig">{{ formData.receivedFromSig }}</div>
          <div class="preview-field pos-received-by-sig">{{ formData.receivedBySig }}</div>
        </div>
        <img src="/money-receipt.jpeg" alt="Receipt Template" class="receipt-image">
      </div>

      <div class="preview-actions">
        <button class="btn btn-primary" @click="downloadReceipt">{{ helper.t('Download / Print') }}</button>
        <button class="btn btn-success" @click="saveReceipt">{{ helper.t('Save') }}</button>
      </div>
    </div>

    <!-- Saved Receipts -->
    <div v-if="receipts.length" class="saved-receipts-section">
      <h2>{{ helper.t('Saved Receipts') }}</h2>
      <div class="receipts-grid">
        <div v-for="receipt in receipts" :key="receipt.id" class="receipt-card">
          <div class="receipt-card-header">
            <span class="receipt-no">No: {{ receipt.receiptNo }}</span>
            <span class="receipt-date">{{ moment(receipt.date).format('DD MMM YYYY') }}</span>
          </div>
          <div class="receipt-card-body">
            <p><strong>From:</strong> {{ receipt.receivedFrom }}</p>
            <p><strong>Amount:</strong> {{ parseFloat(receipt.amount || 0).toFixed(2) }} BDT</p>
            <p><strong>For:</strong> {{ receipt.paymentFor }}</p>
          </div>
          <div class="receipt-card-actions">
            <button class="btn-small btn-edit" @click="editReceipt(receipt)">{{ helper.t('Edit') }}</button>
            <button class="btn-small btn-delete" @click="deleteReceipt(receipt.id)">{{ helper.t('Delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  font-size: 24px;
  color: #111827;
  margin: 0;
}

.form-header p {
  color: #6b7280;
  margin: 6px 0 0;
}

/* Receipt Background Container */
.receipt-bg-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto 20px;
  aspect-ratio: 16 / 9;
}

.receipt-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.receipt-overlay,
.receipt-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
}

.receipt-form {
  position: relative;
  width: 100%;
  height: 100%;
}

.field-wrapper {
  position: absolute;
  background: transparent;
}

.field-wrapper input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  font-family: Arial, sans-serif;
}

.field-wrapper input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.field-wrapper input::placeholder {
  color: #d1d5db;
}

.field-wrapper input:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* Position mappings based on image layout */
.pos-no { top: 7%; left: 7%; width: 12%; height: 4%; }
.pos-date { top: 7%; right: 8%; width: 16%; height: 4%; }
.pos-received-from { top: 14%; left: 7%; width: 85%; height: 3%; }
.pos-amount { top: 22%; left: 7%; width: 85%; height: 3%; }
.pos-bdt { top: 31%; left: 7%; width: 85%; height: 5%; }
.pos-payment-for { top: 39%; left: 7%; width: 85%; height: 3%; }
.pos-current-balance { top: 52%; left: 7%; width: 27%; height: 3%; }
.pos-payment-amount { top: 57%; left: 7%; width: 27%; height: 3%; }
.pos-balance-due { top: 62%; left: 7%; width: 27%; height: 3%; }
.pos-received-from-sig { top: 68%; left: 20%; width: 25%; height: 8%; }
.pos-received-by-sig { top: 68%; right: 15%; width: 25%; height: 8%; }

/* Preview Fields */
.preview-field {
  position: absolute;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
  display: flex;
  align-items: center;
}

.receipt-preview-bg {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
}

/* Actions */
.form-actions,
.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* Saved Receipts */
.saved-receipts-section {
  margin-top: 40px;
}

.saved-receipts-section h2 {
  color: #111827;
  margin-bottom: 20px;
  font-size: 20px;
}

.receipts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.receipt-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.receipt-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.receipt-no {
  font-weight: 600;
  color: #111827;
}

.receipt-date {
  font-size: 12px;
  color: #6b7280;
}

.receipt-card-body p {
  margin: 8px 0;
  font-size: 13px;
  color: #4b5563;
}

.receipt-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-small {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #dbeafe;
  color: #0369a1;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Preview Header */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-title {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

@media print {
  .form-actions,
  .preview-actions,
  .preview-header,
  .saved-receipts-section {
    display: none !important;
  }

  .receipt-bg-container,
  .receipt-preview-bg {
    margin: 0;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .receipt-bg-container,
  .receipt-preview-bg {
    aspect-ratio: auto;
    min-height: 600px;
  }

  .receipts-grid {
    grid-template-columns: 1fr;
  }

  .preview-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
