<template>
  <div class="hide_onprint month-picker month-picker-single">
    <div class="month-control usn cp" @click.stop="resetToCurrent">
      <button class="month-nav" type="button" @click.stop="shiftMonth(-1)">
        <i class='bx bx-chevron-left'></i>
      </button>
      <div class="month-label">{{ monthLabel }}</div>
      <button class="month-nav" type="button" @click.stop="shiftMonth(1)" :disabled="isFutureDisabled">
        <i class='bx bx-chevron-right'></i>
      </button>
    </div>
  </div>
</template>

<script>
import moment from 'moment/moment'

export default {
  name: "MonthPickerSingle",
  props: {
    onChange: {
      type: Function,
      default: () => {},
    },
    defaultValue: {
      type: String,
      default: null,
    },
    dayOfMonth: {
      type: Number,
      default: 1,
    },
    inactiveFutureMonth: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let month = this.defaultValue ? moment(this.defaultValue, 'YYYY-MM-DD') : moment().startOf('month')
    if (!month.isValid()) month = moment().startOf('month')
    month = month.startOf('month')

    const currentMonth = moment().startOf('month')
    if (this.inactiveFutureMonth && month.isAfter(currentMonth)) {
      month = currentMonth.clone()
    }

    return {
      monthValue: month,
      startValue: '',
      endValue: '',
    }
  },
  computed: {
    monthLabel() {
      return this.monthValue.format('MMM YYYY')
    },
    isFutureDisabled() {
      if (!this.inactiveFutureMonth) return false
      const nextMonth = this.monthValue.clone().add(1, 'month')
      return nextMonth.isAfter(moment().startOf('month'))
    },
  },
  methods: {
    resetToCurrent() {
      this.monthValue = moment().startOf('month')
      this.setDatesAndEmit()
    },
    shiftMonth(delta) {
      const nextMonth = this.monthValue.clone().add(delta, 'month')
      if (this.inactiveFutureMonth && nextMonth.isAfter(moment().startOf('month'))) {
        return
      }
      this.monthValue = nextMonth
      this.setDatesAndEmit()
    },
    setDatesAndEmit() {
      const safeDay = Math.min(this.dayOfMonth || 1, this.monthValue.daysInMonth())
      this.startValue = moment({
        year: this.monthValue.year(),
        month: this.monthValue.month(),
        day: safeDay,
      }).format('YYYY-MM-DD')

      this.endValue = this.monthValue.clone().endOf('month').format('YYYY-MM-DD')
      this.onChange([this.startValue, this.endValue])
    },
  },
  mounted() {
    this.setDatesAndEmit()
  },
}
</script>

<style scoped>
.month-picker{
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 2px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.month-control{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.month-label{
  font-weight: 400;
  color: #1f2937;
  min-width: 60px;
  text-align: center;
}

.month-nav{
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  background: #e2e8f0;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.month-nav:hover{
  background: #cbd5e1;
}

.month-nav:active{
  transform: translateY(1px);
}

.month-nav:disabled{
  opacity: 0.6;
  cursor: not-allowed;
  background: #e5e7eb;
}

@media (max-width: 720px) {
  .month-picker{
    flex-direction: column;
    align-items: flex-start;
  }
  .month-label{
    min-width: 140px;
  }
}
</style>
