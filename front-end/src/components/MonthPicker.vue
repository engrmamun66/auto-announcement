<template>
  <div class="hide_onprint month-picker">
    <div class="month-control">
      <button class="month-nav" type="button" @click.stop="shiftStart(-1)">
        <i class='bx bx-chevron-left'></i>
      </button>
      <div class="month-label" data-no-auto-i18n="true">{{ startLabel }}</div>
      <button class="month-nav" type="button" @click.stop="shiftStart(1)" :disabled="isFutureStartDisabled">
        <i class='bx bx-chevron-right'></i>
      </button>
    </div>

    <div class="month-control">
      <button class="month-nav" type="button" @click.stop="shiftEnd(-1)">
        <i class='bx bx-chevron-left'></i>
      </button>
      <div class="month-label" data-no-auto-i18n="true">{{ endLabel }}</div>
      <button class="month-nav" type="button" @click.stop="shiftEnd(1)" :disabled="isFutureEndDisabled">
        <i class='bx bx-chevron-right'></i>
      </button>
    </div>
  </div>
</template>

<script>
import moment from 'moment/moment'

export default {
  name: "TermPicker",
  props: {
    onChange: {
      type: Function,
      default: () => {},
    },
    startName: {
      type: String,
      default: "start",
    },
    defaultStartValue: {
      type: String,
      default: null,
    },
    defaultEndValue: {
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
    let start = this.defaultStartValue ? moment(this.defaultStartValue, 'YYYY-MM-DD') : moment().startOf('month')
    let end = this.defaultEndValue ? moment(this.defaultEndValue, 'YYYY-MM-DD') : moment().endOf('month')

    if (!start.isValid()) start = moment().startOf('month')
    if (!end.isValid()) end = moment().endOf('month')

    start = start.startOf('month')
    end = end.startOf('month')

    const currentMonth = moment().startOf('month')
    if (this.inactiveFutureMonth && end.isAfter(currentMonth)) {
      end = currentMonth.clone()
    }
    if (start.isAfter(end)) {
      start = end.clone()
    }

    return {
      startMonth: start,
      endMonth: end,
      startValue: '',
      endValue: '',
    }
  },
  computed: {
    startLabel() {
      return this.startMonth.format('MMM YYYY')
    },
    endLabel() {
      return this.endMonth.format('MMM YYYY')
    },
    isFutureStartDisabled() {
      if (!this.inactiveFutureMonth) return false
      const nextStart = this.startMonth.clone().add(1, 'month')
      const currentMonth = moment().startOf('month')
      return nextStart.isAfter(currentMonth)
    },
    isFutureEndDisabled() {
      if (!this.inactiveFutureMonth) return false
      const nextEnd = this.endMonth.clone().add(1, 'month')
      const currentMonth = moment().startOf('month')
      return nextEnd.isAfter(currentMonth)
    },
  },
  methods: {
    loadFromStorage() {
      if (typeof window === "undefined" || !window.localStorage) return false
      const raw = window.localStorage.getItem("monthPickerRange")
      if (!raw) return false
      try {
        const saved = JSON.parse(raw)
        if (
          typeof saved?.startYear !== "number" ||
          typeof saved?.startMonth !== "number" ||
          typeof saved?.endYear !== "number" ||
          typeof saved?.endMonth !== "number"
        ) {
          return false
        }
        let start = moment({ year: saved.startYear, month: saved.startMonth }).startOf('month')
        let end = moment({ year: saved.endYear, month: saved.endMonth }).startOf('month')
        const currentMonth = moment().startOf('month')
        if (this.inactiveFutureMonth && end.isAfter(currentMonth)) {
          end = currentMonth.clone()
        }
        if (start.isAfter(end)) {
          start = end.clone()
        }
        this.startMonth = start
        this.endMonth = end
        return true
      } catch (err) {
        return false
      }
    },
    saveToStorage() {
      if (typeof window === "undefined" || !window.localStorage) return
      const payload = {
        startYear: this.startMonth.year(),
        startMonth: this.startMonth.month(),
        endYear: this.endMonth.year(),
        endMonth: this.endMonth.month(),
      }
      window.localStorage.setItem("monthPickerRange", JSON.stringify(payload))
    },
    shiftStart(delta) {
      let nextStart = this.startMonth.clone().add(delta, 'month')
      const currentMonth = moment().startOf('month')
      if (this.inactiveFutureMonth && nextStart.isAfter(currentMonth)) {
        return
      }
      if (nextStart.isAfter(this.endMonth)) {
        this.endMonth = nextStart.clone()
      }
      this.startMonth = nextStart
      this.setDatesAndEmit()
    },
    shiftEnd(delta) {
      let nextEnd = this.endMonth.clone().add(delta, 'month')
      const currentMonth = moment().startOf('month')
      if (this.inactiveFutureMonth && nextEnd.isAfter(currentMonth)) {
        return
      }
      if (nextEnd.isBefore(this.startMonth)) {
        this.startMonth = nextEnd.clone()
      }
      this.endMonth = nextEnd
      this.setDatesAndEmit()
    },
    setDatesAndEmit() {
      const safeStartDay = Math.min(
        this.dayOfMonth || 1,
        this.startMonth.daysInMonth()
      )
      this.startValue = moment({
        year: this.startMonth.year(),
        month: this.startMonth.month(),
        day: safeStartDay,
      }).format('YYYY-MM-DD')

      this.endValue = this.endMonth.clone().endOf('month').format('YYYY-MM-DD')
      this.onChange([this.startValue, this.endValue])
      this.saveToStorage()
    },
  },
  mounted() {
    this.loadFromStorage()
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
  font-weight: 600;
  color: #1f2937;
  min-width: 80px;
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
