<template>
  <template v-if="modelValue">
    <teleport to="body">
      <div
        class="modal fade fadeUp"
        :class="{ show: modelValue }"
        :style="modelValue ? 'display: block' : 'display: none'"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div @click="$event.stopPropagation()" class="modal-content">
            <div class="modal-body mt-4">
              <div class="col-12">
                <h4 class="text-center">{{ helper.t('Enter password to confirm') }}</h4>
                <input
                  ref="passwordInput"
                  v-model="password"
                  type="password"
                  class="form-control cb-input mt-3"
                  :placeholder="helper.t('Password')"
                  style="background-color: white !important; color: black !important"
                  @keyup.enter="confirm()"
                  @keyup.esc="cancel()"
                >
                <div v-if="errorMessage" class="text-danger mt-2 text-center small">
                  {{ errorMessage }}
                </div>
              </div>
            </div>
            <hr>
            <div class="modal-footer">
              <button @click.stop="cancel()" type="button" class="btn-cb red">
                {{ helper.t('Cancel') }}
              </button>
              <button @click.stop="confirm()" type="button" class="btn-cb green">
                {{ helper.t('Confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </template>
</template>

<script setup>
import { ref, inject, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'yes', 'no']);

const helper = inject('helper');
const http = inject('http');
const password = ref('');
const errorMessage = ref('');
const passwordInput = ref(null);

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    passwordInput.value?.focus();
  }
});

const confirm = async () => {
  if (!password.value) {
    errorMessage.value = helper.t('Password required');
    return;
  }

  try {
    await http.post('/verify-password', { password: password.value });
    emit('yes');
    close();
  } catch (err) {
    errorMessage.value = helper.t('Incorrect password');
  }
};

const cancel = () => {
  emit('no');
  close();
};

const close = () => {
  password.value = '';
  errorMessage.value = '';
  emit('update:modelValue', false);
};
</script>

<style scoped>
.modal {
  background-color: rgb(0 0 0 / 59%);
}

.modal-dialog {
  max-width: 360px;
}

.modal.show .modal-content {
  animation: mymove 0.3s;
}

@keyframes mymove {
  from {
    transform: translateY(-100px);
    opacity: 0;
    scale: 0.5;
  }
  to {
    transform: translateY(0px);
    opacity: 1;
    scale: 1;
  }
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 0px 1rem;
}

.modal-footer {
  position: relative;
  padding: 1rem;
  border-top: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.cb-input {
  border: 1px solid #444 !important;
  background: #2a2a2a !important;
  color: #fff !important;
  border-radius: 6px !important;
}

.cb-input::placeholder {
  color: #888 !important;
}

.cb-input:focus {
  border-color: #4caf50 !important;
  background: #333 !important;
  color: #fff !important;
  outline: none !important;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25) !important;
}

.btn-cb {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-cb.red {
  background: #f44336;
  color: #fff;
}

.btn-cb.red:hover {
  background: #d32f2f;
}

.btn-cb.green {
  background: #4caf50;
  color: #fff;
}

.btn-cb.green:hover {
  background: #43a047;
}
</style>
