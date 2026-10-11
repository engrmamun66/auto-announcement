<script setup>
// Punch Board card for designs 2-4 (see pages/punchCardDesigns.js). Design 1 stays inline in home.vue.
import moment from 'moment/moment'
import { computed, inject } from 'vue'
import PlayingAnimation from './PlayingAnimation.vue'

const props = defineProps({
  student: { type: Object, required: true },
  design: { type: Number, required: true },
  status: { type: String, required: true }, // waiting | calling | paused | completed | error
  width: { type: Number, default: 200 },
  mainDakhela: { default: false },
})
const emit = defineEmits(['open', 'recall', 'remove'])

const helper = inject('helper')
const CONFIG = inject('CONFIG')
const callbacks = inject('callbacks')

const name = computed(() => String(props.student?.name || '').split('||')[0])
const statusLabel = computed(() => ({
  waiting: helper.t('Waitting'),
  calling: helper.t('Calling...'),
  paused: helper.t('Paused'),
  completed: helper.t('Completed'),
  error: helper.t('Error'),
}[props.status]))
const statusIcon = computed(() => ({
  waiting: 'bx bx-time-five',
  calling: 'bx bxs-volume-full',
  paused: 'bx bx-pause',
  completed: 'bx bx-sync',
  error: 'bx bx-error',
}[props.status]))
const punchedTooltip = computed(() =>
  props.student?.call_slot ? 'Punched: ' + moment(props.student.punch_exact_time_text).format('hh:mm:ss A') : ''
)
const ownerName = computed(() => callbacks.getCardOwnerName(props.student?.card_owner))
const showOwner = computed(() => ownerName.value && CONFIG.value?.card_not_set_message)
const isPlaying = computed(() => props.status === 'calling' || props.status === 'paused')

const photo = computed(() => {
  const img = props.student?.profile_image
  if (!img) return '/default-profile-image.png'
  if (/^https?:\/\//i.test(img) || /^data:/i.test(img)) return img
  return img.startsWith('/') ? img : `/${img}`
})

// Completed cards can be recalled by clicking the status chip (same as design 1)
function onStatusClick() {
  if (props.status === 'completed') emit('recall')
}
</script>

<template>
  <div class="pc" :class="[`pc--d${design}`, `is-${status}`]" :style="design === 4 ? '' : `--std-card-width:${width}px`"
    :barcode="student?.barcode" :card-id="student?.id">

    <!-- ===== 2: Ticket ===== -->
    <template v-if="design === 2">
      <div class="pc-ticket__stub">
        <span class="pc-ticket__label">ID</span>
        <span class="pc-ticket__no">{{ student.dakhela }}</span>
        <span v-if="mainDakhela" class="pc-ticket__main">main {{ mainDakhela }}</span>
      </div>
      <div class="pc-ticket__body">
        <div class="pc-row">
          <button type="button" class="pc-status" :class="{ cp: status === 'completed' }" @click.stop="onStatusClick">
            <i :class="statusIcon"></i> {{ statusLabel }}
          </button>
          <span v-if="student?.total_punch > 1" class="pc-count">{{ helper.t('Punched:') }} {{ student.total_punch }}</span>
          <span v-if="isPlaying && status !== 'error'" class="pc-playing"><PlayingAnimation></PlayingAnimation></span>
        </div>
        <div class="pc-name" @click="emit('open', false)">{{ name }}</div>
        <div class="pc-sub">{{ student.class }}</div>
        <div class="pc-slot" :tooltip="punchedTooltip" @click.stop="emit('open', true)">
          <span v-if="!student?.call_slot && student?.emergency_mode" class="text-danger">{{ helper.t('Emergency Call') }}</span>
          <span v-else v-html="student?.call_slot"></span>
        </div>
      </div>
    </template>

    <!-- ===== 3: Neon Glow ===== -->
    <template v-else-if="design === 3">
      <span class="pc-neon__gloss"></span>
      <div class="pc-row">
        <button type="button" class="pc-status" :class="{ cp: status === 'completed' }" @click.stop="onStatusClick">
          <i :class="statusIcon"></i> {{ statusLabel }}
        </button>
        <span v-if="student?.total_punch > 1" class="pc-count">×{{ student.total_punch }}</span>
        <span v-if="isPlaying && status !== 'error'" class="pc-playing"><PlayingAnimation></PlayingAnimation></span>
      </div>
      <div class="pc-neon__head">
        <span class="pc-neon__avatar"><img :src="photo" alt="profile" /></span>
        <div class="pc-neon__title">
          <div class="pc-name" @click="emit('open', false)">{{ name }}</div>
          <div class="pc-sub">{{ student.class }} · #{{ student.dakhela }}<template v-if="mainDakhela"> · main {{ mainDakhela }}</template></div>
        </div>
      </div>
      <div class="pc-slot" :tooltip="punchedTooltip" @click.stop="emit('open', true)">
        <span v-if="!student?.call_slot && student?.emergency_mode" class="text-danger">{{ helper.t('Emergency Call') }}</span>
        <span v-else v-html="student?.call_slot"></span>
      </div>
    </template>

    <!-- ===== 4: Compact Row ===== -->
    <template v-else>
      <span class="pc-compact__avatar"><img :src="photo" alt="profile" /></span>
      <div class="pc-compact__main">
        <div class="pc-name" @click="emit('open', false)">{{ name }}</div>
        <div class="pc-sub">{{ student.class }} · #{{ student.dakhela }}<template v-if="mainDakhela"> · main {{ mainDakhela }}</template></div>
      </div>
      <div class="pc-slot pc-compact__slot" :tooltip="punchedTooltip" @click.stop="emit('open', true)">
        <span v-if="!student?.call_slot && student?.emergency_mode" class="text-danger">{{ helper.t('Emergency Call') }}</span>
        <span v-else v-html="student?.call_slot"></span>
      </div>
      <span v-if="student?.total_punch > 1" class="pc-count">×{{ student.total_punch }}</span>
      <span v-if="isPlaying && status !== 'error'" class="pc-playing"><PlayingAnimation></PlayingAnimation></span>
      <button type="button" class="pc-status" :class="{ cp: status === 'completed' }" @click.stop="onStatusClick">
        <i :class="statusIcon"></i> {{ statusLabel }}
      </button>
    </template>

    <!-- Shared extras -->
    <div v-if="showOwner" class="pc-owner" tooltip="Card Owner">
      <span>
        <i class='bx bxs-id-card'></i>
        {{ student.card_owner ? ownerName : CONFIG.card_not_set_message }}
      </span>
    </div>
    <div v-if="status === 'error'" class="pc-error" @click="emit('open', false)">
      <span>এই অডিওটি পুনরায় রেকর্ড করুন!</span>
      <button type="button" class="pc-error__btn">{{ helper.t('Click Here') }}</button>
    </div>

    <button type="button" class="pc-close" :title="helper.t('Remove')" @click.stop="emit('remove')"><i class='bx bx-x'></i></button>
  </div>
</template>

<style scoped>
/* Status colours shared by all designs (same as the original punch board chips) */
.pc{
  --pc-accent: #eab308;      /* waiting */
  --pc-accent-2: #facc15;
  --pc-on-accent: #1f2937;
  position: relative;
  width: var(--std-card-width, 200px);
  box-sizing: border-box;
}
.pc.is-calling{ --pc-accent: #e905bf; --pc-accent-2: #a855f7; --pc-on-accent: #fff; }
.pc.is-paused{ --pc-accent: #e96005; --pc-accent-2: #f59e0b; --pc-on-accent: #fff; }
.pc.is-completed{ --pc-accent: #07a527; --pc-accent-2: #22c55e; --pc-on-accent: #fff; }
.pc.is-error{ --pc-accent: #e92705; --pc-accent-2: #f43f5e; --pc-on-accent: #fff; }

.pc-row{ display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
/* Playing bars sit in a fixed-height slot so the card never grows when calling starts */
.pc-playing{
  display: inline-flex;
  align-items: center;
  height: 18px;
  overflow: visible;
}
.pc-status{
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  border-radius: 999px;
  padding: 1px 9px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.6;
  white-space: nowrap;
  color: var(--pc-on-accent);
  background: var(--pc-accent);
  cursor: default;
}
.pc-status.cp{ cursor: pointer; }
.pc-count{
  font-size: 11px;
  font-weight: 700;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
}
.pc-name{
  font-weight: 700;
  cursor: pointer;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.pc-name:hover{ text-decoration: underline; }
.pc-sub{ font-size: 12px; opacity: 0.8; }
.pc-slot{ font-size: 13px; cursor: pointer; }
.pc-owner{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
}
.pc-error{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
}
.pc-error__btn{
  border: none;
  border-radius: 6px;
  padding: 1px 8px;
  font-size: 11px;
  color: #fff;
  background: #dc2626;
}
.pc-close{
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  z-index: 2;
  transition: background 0.15s, color 0.15s;
}
.pc-close:hover{ color: #fff; background: #dc2626; }
.pc.is-completed{ opacity: 0.75; }

/* ===== 2: Ticket ===== */
.pc--d2{
  display: flex;
  min-height: 112px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pc--d2:hover{ transform: translateY(-2px); box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16); }
.pc--d2.is-calling{ box-shadow: 0 0 0 2px var(--pc-accent), 0 8px 20px rgba(233, 5, 191, 0.3); }
.pc-ticket__stub{
  position: relative;
  flex: 0 0 auto;
  min-width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 8px;
  color: var(--pc-on-accent);
  background: linear-gradient(160deg, var(--pc-accent-2), var(--pc-accent));
  border-right: 2px dashed rgba(255, 255, 255, 0.75);
}
.pc-ticket__stub::before,
.pc-ticket__stub::after{ /* perforation notches */
  content: '';
  position: absolute;
  right: -8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e5e7eb;
}
.pc-ticket__stub::before{ top: -7px; }
.pc-ticket__stub::after{ bottom: -7px; }
.pc-ticket__label{ font-size: 10px; font-weight: 700; letter-spacing: 1px; opacity: 0.85; }
.pc-ticket__no{ font-size: 17px; font-weight: 800; line-height: 1.1; white-space: nowrap; text-align: center; font-variant-numeric: tabular-nums; }
.pc-ticket__main{ font-size: 9px; opacity: 0.85; text-align: center; }
.pc-ticket__body{
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 30px 8px 12px;
  color: #1f2937;
}
.pc--d2 .pc-name{ color: #0f172a; font-size: 15px; }
.pc--d2 .pc-slot{
  align-self: flex-start;
  padding: 1px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #334155;
}
.pc--d2 .pc-owner,
.pc--d2 .pc-error{ position: absolute; left: 76px; right: 10px; bottom: 6px; }
.pc--d2:has(.pc-owner),
.pc--d2:has(.pc-error){ padding-bottom: 22px; }

/* ===== 3: Neon Glow ===== */
@property --pc-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.pc--d3{
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  padding: 10px 12px 12px;
  border-radius: 14px;
  overflow: hidden;
  color: #e2e8f0;
  border: 2px solid color-mix(in srgb, var(--pc-accent) 70%, transparent);
  background:
    radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--pc-accent) 30%, transparent), transparent 70%),
    linear-gradient(160deg, #111827 0%, #1e1b4b 55%, #0f172a 100%);
  box-shadow: 0 0 10px color-mix(in srgb, var(--pc-accent) 35%, transparent);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pc--d3:hover{ transform: translateY(-2px); box-shadow: 0 0 18px color-mix(in srgb, var(--pc-accent) 55%, transparent); }
/* Only the card being called gets the spinning neon border */
.pc--d3.is-calling{
  border: 2px solid transparent;
  background:
    radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--pc-accent) 30%, transparent), transparent 70%) padding-box,
    linear-gradient(160deg, #111827 0%, #1e1b4b 55%, #0f172a 100%) padding-box,
    conic-gradient(from var(--pc-angle), #e905bf, #a855f7, #06b6d4, #e905bf) border-box;
  animation: pcSpin 3s linear infinite;
  box-shadow: 0 0 18px rgba(233, 5, 191, 0.55), 0 0 36px -8px rgba(168, 85, 247, 0.6);
}
@keyframes pcSpin{ to { --pc-angle: 360deg; } }
.pc-neon__gloss{
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(175deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0) 45%);
}
.pc--d3 .pc-row,
.pc--d3 .pc-neon__head,
.pc--d3 .pc-slot,
.pc--d3 .pc-owner,
.pc--d3 .pc-error{ position: relative; }
.pc--d3 .pc-count{ background: rgba(255, 255, 255, 0.12); color: #fff; }
.pc--d3 .pc-status{ box-shadow: 0 0 8px color-mix(in srgb, var(--pc-accent) 60%, transparent); }
.pc-neon__head{ display: flex; align-items: center; gap: 10px; padding-right: 18px; }
.pc-neon__avatar{
  flex-shrink: 0;
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pc-accent), var(--pc-accent-2));
  box-shadow: 0 0 10px color-mix(in srgb, var(--pc-accent) 60%, transparent);
}
.pc-neon__avatar img{
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #1e293b;
  border: 2px solid #0f172a;
}
.pc-neon__title{ min-width: 0; }
.pc--d3 .pc-name{ color: #fff; font-size: 15px; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4); }
.pc--d3 .pc-sub{ color: #94a3b8; opacity: 1; }
.pc--d3 .pc-slot{
  padding: 3px 10px;
  border-radius: 8px;
  color: #fff;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.pc--d3 .pc-error{ color: #fecaca; }
.pc--d3 .pc-close{ color: #cbd5e1; background: rgba(255, 255, 255, 0.12); }

/* ===== 4: Compact Row ===== */
.pc--d4{
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  padding: 8px 40px 8px 12px;
  border-radius: 10px;
  background: #fff;
  border-left: 5px solid var(--pc-accent);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.1);
  transition: background 0.15s;
}
.pc--d4:hover{ background: #f8fafc; }
.pc--d4.is-calling{ background: color-mix(in srgb, var(--pc-accent) 8%, #fff); box-shadow: 0 0 0 1px var(--pc-accent), 0 2px 10px rgba(233, 5, 191, 0.2); }
.pc-compact__avatar img{
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #f1f5f9;
  border: 2px solid var(--pc-accent);
}
.pc-compact__main{ flex: 1 1 180px; min-width: 0; }
.pc--d4 .pc-name{ color: #0f172a; -webkit-line-clamp: 1; }
.pc--d4 .pc-sub{ color: #64748b; opacity: 1; }
.pc-compact__slot{
  padding: 1px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #334155;
  white-space: nowrap;
}
.pc--d4 .pc-owner,
.pc--d4 .pc-error{ flex-basis: 100%; margin-top: 0; padding-left: 48px; }
.pc--d4 .pc-close{ top: 50%; transform: translateY(-50%); }

@media (prefers-reduced-motion: reduce){
  .pc--d3.is-calling{ animation: none; }
}
</style>
