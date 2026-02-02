<template>
    <div :class="['termInput', selectingStart || selectingEnd ? 'active' : '']" tabindex="-1">
        <div class="rangePanels">
            <div class="rangePanel" :class="selectingStart ? 'isActive' : ''" @click="openStartPicker">
                <div class="yearRow">
                    <button type="button" class="yearBtn" @click.stop="changeYear('start', -1)">-</button>
                    <span class="yearValue">{{ startYear }}</span>
                    <button type="button" class="yearBtn" @click.stop="changeYear('start', 1)"
                        :disabled="isFutureYear(startYear + 1)">+</button>
                </div>
                <div class="monthRow">
                    <div class="monthSelectWrap">
                        <select class="monthSelect" :value="startMonth" @change="onMonthChange('start', $event)">
                            <option v-for="(monthLabel, monthIndex) in months" :key="monthIndex" :value="monthIndex"
                                :disabled="isFutureMonth(startYear, monthIndex)">
                                {{ monthLabel }}
                            </option>
                        </select>
                        <span class="monthCaret"></span>
                    </div>
                </div>
            </div>

            <div class="rangePanel" :class="selectingEnd ? 'isActive' : ''" @click="openEndPicker">
                <div class="yearRow">
                    <button type="button" class="yearBtn" @click.stop="changeYear('end', -1)">-</button>
                    <span class="yearValue">{{ endYear }}</span>
                    <button type="button" class="yearBtn" @click.stop="changeYear('end', 1)"
                        :disabled="isFutureYear(endYear + 1)">+</button>
                </div>
                <div class="monthRow">
                    <div class="monthSelectWrap">
                        <select class="monthSelect" :value="endMonth" @change="onMonthChange('end', $event)">
                            <option v-for="(monthLabel, monthIndex) in months" :key="monthIndex" :value="monthIndex"
                                :disabled="isFutureMonth(endYear, monthIndex)">
                                {{ monthLabel }}
                            </option>
                        </select>
                        <span class="monthCaret"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import moment from 'moment/moment'

const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function pad(padStr, str, padLeft) {
    if (typeof str === "undefined") return padStr;
    if (padLeft) return (padStr + str).slice(-padStr.length);
    else return (str + padStr).substring(0, padStr.length);
}

const dateToLocalMidnightDateTime = (date) =>
    new Date(
        new Date(date).setTime(
            new Date(date).getTime() +
            (new Date(date).getTimezoneOffset() / 60) * 60 * 60 * 1000
        )
    );

export default {
    name: "TermPicker",
    props: {
        onChange: {
            type: Function,
            default: () => { },
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
        const currentDate = new Date();
        const startDate = this.defaultStartValue
            ? dateToLocalMidnightDateTime(this.defaultStartValue)
            : new Date(new Date(currentDate).setMonth(currentDate.getMonth() + 1));
        const endDate = this.defaultEndValue
            ? dateToLocalMidnightDateTime(this.defaultEndValue)
            : new Date(new Date(currentDate).setMonth(currentDate.getMonth() + 12));

        const startValue = `${startDate.getFullYear()}-${pad(
            "00",
            startDate.getMonth() + 1,
            true
        )}-${pad("00", this.dayOfMonth, true)}`;

        const endValue = `${endDate.getFullYear()}-${pad(
            "00",
            endDate.getMonth() + 1,
            true
        )}-${pad("00", this.dayOfMonth, true)}`;

        return {
            months,
            selectingStart: false,
            selectingEnd: false,
            yearContext: startDate.getFullYear(),
            startMonth: startDate.getMonth(),
            endMonth: endDate.getMonth(),
            startYear: startDate.getFullYear(),
            endYear: endDate.getFullYear(),
            startValue,
            endValue,
        };
    },
    computed: {
        picking() {
            return this.selectingStart || this.selectingEnd;
        },
    },
    methods: {
        getNowParts() {
            const now = new Date();
            return { year: now.getFullYear(), month: now.getMonth() };
        },
        isFutureYear(year) {
            if (!this.inactiveFutureMonth) return false;
            const nowYear = this.getNowParts().year;
            return year > nowYear;
        },
        clampToCurrentMonthIfFuture(year, month) {
            if (!this.inactiveFutureMonth) return { year, month };
            const { year: nowYear, month: nowMonth } = this.getNowParts();
            let nextYear = year;
            let nextMonth = month;
            if (nextYear > nowYear) {
                nextYear = nowYear;
            }
            if (nextYear === nowYear && nextMonth > nowMonth) {
                nextMonth = nowMonth;
            }
            return { year: nextYear, month: nextMonth };
        },
        loadFromStorage() {
            if (typeof window === "undefined" || !window.localStorage) return false;
            const raw = window.localStorage.getItem("monthPickerRange");
            if (!raw) return false;
            try {
                const saved = JSON.parse(raw);
                if (
                    typeof saved?.startYear !== "number" ||
                    typeof saved?.startMonth !== "number" ||
                    typeof saved?.endYear !== "number" ||
                    typeof saved?.endMonth !== "number"
                ) {
                    return false;
                }
                const start = this.clampToCurrentMonthIfFuture(saved.startYear, saved.startMonth);
                const end = this.clampToCurrentMonthIfFuture(saved.endYear, saved.endMonth);

                const nextState = this.fixDates({
                    selectingStart: false,
                    selectingEnd: false,
                    yearContext: start.year,
                    startMonth: start.month,
                    startYear: start.year,
                    endMonth: end.month,
                    endYear: end.year,
                });

                Object.assign(this, nextState);
                return true;
            } catch (err) {
                return false;
            }
        },
        saveToStorage() {
            if (typeof window === "undefined" || !window.localStorage) return;
            const payload = {
                startYear: this.startYear,
                startMonth: this.startMonth,
                endYear: this.endYear,
                endMonth: this.endMonth,
            };
            window.localStorage.setItem("monthPickerRange", JSON.stringify(payload));
        },
        handleDocumentClick(event) {
            if (!this.picking) return;
            if (!this.$el || this.$el.contains(event.target)) return;
            this.closePicker();
        },
        openStartPicker() {
            this.yearContext = this.startYear;
            this.selectingStart = true;
            this.selectingEnd = false;
        },
        openEndPicker() {
            this.yearContext = this.endYear;
            this.selectingStart = false;
            this.selectingEnd = true;
        },
        closePicker() {
            this.selectingStart = false;
            this.selectingEnd = false;
        },
        setActive(which) {
            if (which === "start") {
                this.openStartPicker();
            } else {
                this.openEndPicker();
            }
        },
        changeYear(which, delta) {
            this.setActive(which);
            let { startMonth, startYear, endMonth, endYear } = this;

            if (which === "start") {
                const nextYear = startYear + delta;
                if (this.isFutureYear(nextYear)) return;
                startYear = nextYear;
            } else {
                const nextYear = endYear + delta;
                if (this.isFutureYear(nextYear)) return;
                endYear = nextYear;
            }

            if (which === "start") {
                const clamped = this.clampToCurrentMonthIfFuture(startYear, startMonth);
                startYear = clamped.year;
                startMonth = clamped.month;
            } else {
                const clamped = this.clampToCurrentMonthIfFuture(endYear, endMonth);
                endYear = clamped.year;
                endMonth = clamped.month;
            }

            const nextState = this.fixDates({
                selectingStart: which === "start",
                selectingEnd: which === "end",
                yearContext: which === "start" ? startYear : endYear,
                startMonth,
                startYear,
                endMonth,
                endYear,
            });

            Object.assign(this, nextState);
            this.setDates();
            this.fireChange();
        },
        onMonthChange(which, event) {
            const newMonth = Number(event?.target?.value);
            if (Number.isNaN(newMonth)) return;

            this.setActive(which);
            let { startMonth, startYear, endMonth, endYear } = this;

            if (which === "start") {
                startMonth = newMonth;
            } else {
                endMonth = newMonth;
            }

            const targetYear = which === "start" ? startYear : endYear;
            if (this.isFutureMonth(targetYear, newMonth)) {
                return;
            }

            const nextState = this.fixDates({
                selectingStart: which === "start",
                selectingEnd: which === "end",
                yearContext: which === "start" ? startYear : endYear,
                startMonth,
                startYear,
                endMonth,
                endYear,
            });

            Object.assign(this, nextState);
            this.setDates();
            this.fireChange();
        },
        isFutureMonth(year, month) {
            if (!this.inactiveFutureMonth) return false;
            const today = moment().startOf('day');
            const safeDay = Math.min(
                this.dayOfMonth || 1,
                moment({ year, month }).daysInMonth()
            );
            const target = moment({ year, month, day: safeDay }).startOf('day');
            return target.isAfter(today);
        },
        fixDates({
            selectingStart,
            selectingEnd,
            yearContext,
            startMonth,
            startYear,
            endMonth,
            endYear,
            }) {
            if (selectingStart) {
                // Don't let start year exceed end year
                if (startYear > endYear) endYear = startYear;

                // Allow same month/year — only adjust if start > end
                if (startYear === endYear && startMonth > endMonth) {
                endMonth = startMonth;
                }
            } else {
                // Don't let end year go before start year
                if (endYear < startYear) endYear = startYear;

                // Allow same month/year — only adjust if end < start
                if (startYear === endYear && endMonth < startMonth) {
                startMonth = endMonth;
                }
            }

            return {
                selectingStart,
                selectingEnd,
                yearContext,
                startMonth,
                startYear,
                endMonth,
                endYear,
            };
            },
        setDates(field = "all") {
            const { startYear, startMonth, endYear, endMonth, dayOfMonth } = this;

            if (field === "start" || field === "all") {
                const start = moment({ year: startYear, month: startMonth, day: dayOfMonth }).format('YYYY-MM-DD');
                this.startValue = start; 
            }

            if (field === "end" || field === "all") {
                // Always last day of month
                const end = moment({ year: endYear, month: endMonth }).endOf('month').format('YYYY-MM-DD');
                this.endValue = end; 
            }
        },
        fireChange() {
            this.onChange([this.startValue, this.endValue]);
            this.saveToStorage();
        },
    },
    mounted() {
        document.addEventListener("mousedown", this.handleDocumentClick);
        document.addEventListener("touchstart", this.handleDocumentClick, { passive: true });
        this.openStartPicker();
        if (this.loadFromStorage()) {
            this.setDates();
            this.fireChange();
        }
    },
    beforeUnmount() {
        document.removeEventListener("mousedown", this.handleDocumentClick);
        document.removeEventListener("touchstart", this.handleDocumentClick);
    },
    watch: {
        startValue(newVal) {
        },
        endValue(newVal) {
            // this.onChange([this.startValue, this.endValue]);
        },
    },
};
</script>

<style scoped>
.termInput {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  gap: 12px;
  padding: 0;
  border: none;
  border-radius: 0;
  background-color: transparent;
  transition: box-shadow 0.2s;
}

.termInput.active {
  box-shadow: none;
}

.rangePanels {
  display: flex;
  gap: 1px;
}

.rangePanel {
  background-color: #f1f5f9;
  padding: 8px 10px;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 0px;
}
.rangePanel:first-child{
    border-radius: 12px 0px 0px 12px;
}
.rangePanel:last-child {
    border-radius: 0px 12px 12px 0px;
}

.rangePanel.isActive {
  outline: none;
}

.yearRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.yearBtn {
  width: 30px;
  height: 28px;
  border: none;
  border-radius: 12px;
  background-color: #cbd5e1;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.yearBtn:hover {
  background-color: #b9c3d3;
}

.yearBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #d6dbe4;
}

.yearBtn:active {
  transform: translateY(1px);
}

.yearValue {
  flex: 1 1 auto;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  letter-spacing: 1px;
}

.monthRow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.monthSelectWrap {
  position: relative;
  width: 100%;
}

.monthSelect {
  width: 100%;
  border: none;
  background: transparent;
  color: #111827;
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  padding: 0px 29px 0px 29px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.monthSelect:focus {
  outline: none;
}

.monthCaret {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #111827;
  pointer-events: none;
}

@media (max-width: 640px) {
  .termInput {
    width: 100%;
  }

  .rangePanels {
    flex-direction: column;
    gap: 10px;
  }

  .rangePanel {
    min-width: 0;
  }
}
</style>
