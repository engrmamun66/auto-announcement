<template>
    <div :class="[termInput, selectingStart || selectingEnd ? active : '']" tabindex="-1">
        <i class="fa fa-calendar"></i>
        &nbsp;
        <span :class="[termInputControl, isStartMonth, selectingStart ? selecting : '']" ref="startMonthControl"
            @click="openStartPicker">
            {{ months[startMonth] }} {{ startYear }}
        </span>
        &nbsp;&mdash;&nbsp;
        <span :class="[termInputControl, isEndMonth, selectingEnd ? selecting : '']" ref="endMonthControl"
            @click="openEndPicker">
            {{ months[endMonth] }} {{ endYear }}
        </span>

        <!-- <div v-if="picking || true" :class="picker" class="d-flex"> -->
        <div v-if="picking" :class="picker" class="d-flex">
            <div :style="{
                left: selectingEnd ? endMonthCaretPosition : startMonthCaretPosition,
            }" :class="pickerCaret"></div>

            <div v-for="(year, yearIndex) in yearQuarters" :key="yearIndex"
                :class="yearIndex === 0 ? yearOneContext : yearTwoContext">
                <table>
                    <thead>
                        <tr>
                            <th width="15" @click="onSelectYear('decrement')">
                                <svg v-if="yearIndex === 0" viewBox="0 0 51.4 51.4">
                                    <path d="M31.4 45.8L15.3 29.7h36.1v-8H15.3L31.4 5.6 25.7 0 0 25.7l25.7 25.7" />
                                </svg>
                            </th>
                            <th width="70">
                                {{ yearIndex === 0 ? yearContext : yearContext + 1 }}
                            </th>
                            <th width="15" @click="onSelectYear('increment')">
                                <svg v-if="yearIndex === 1" viewBox="0 0 51.4 51.4">
                                    <path d="M20 5.6l16.1 16.1H0v8h36.1L20 45.8l5.7 5.6 25.7-25.7L25.7 0" />
                                </svg>
                            </th>
                        </tr>
                    </thead>
                </table>
                <table>
                    <tbody>
                        <tr v-for="(quarter, quarterIndex) in year" :key="quarterIndex">
                            <td v-for="month in quarter" :key="month" :class="getTdClass(month, yearIndex)">
                                <div @click="onSelectMonth(month, getCurrentYear(yearIndex), 'click')" 
                                @mouseenter__eeeeeeee="onSelectMonth(month, getCurrentYear(yearIndex), 'hover')" 
                                :class="getPickerControlClass(month, yearIndex)">
                                    <div :class="pickerControlInner">
                                        {{ months[month] }}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pickerFooter">
                <button type="button" class="pickerClose" @click="closePicker">Close</button>
                <button type="button" class="pickerSubmit" @click="fireChange">Submit</button>
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

const styles = {
    termInput: "termInput",
    active: "active",
    termInputControl: "termInputControl",
    selecting: "selecting",
    picker: "picker",
    pickerCaret: "pickerCaret",
    yearOneContext: "yearOneContext",
    yearTwoContext: "yearTwoContext",
    pickerControl: "pickerControl",
    isStartMonth: "isStartMonth",
    isEndMonth: "isEndMonth",
    pickerControlInner: "pickerControlInner",
    cellWithinRange: "cellWithinRange",
    selected: "selected",
};

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
            ...styles,
            months,
            selectingStart: false,
            selectingEnd: false,
            yearContext: startDate.getFullYear(),
            startMonth: startDate.getMonth(),
            endMonth: endDate.getMonth(),
            startYear: startDate.getFullYear(),
            endYear: endDate.getFullYear(),
            startMonthCaretPosition: "66px",
            endMonthCaretPosition: "190px",
            startValue,
            endValue,
            yearQuarters: [
                [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [9, 10, 11],
                ],
                [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [9, 10, 11],
                ],
            ],
        };
    },
    computed: {
        picking() {
            return this.selectingStart || this.selectingEnd;
        },
    },
    methods: {
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
            this.yearContext =
                this.endYear === this.startYear ? this.endYear : this.endYear - 1;
            this.selectingStart = false;
            this.selectingEnd = true;
        },
        closePicker() {
            this.selectingStart = false;
            this.selectingEnd = false;
        },
        getCurrentYear(yearIndex) {
            return yearIndex === 0 ? this.yearContext : this.yearContext + 1;
        },
        getTdClass(month, yearIndex) {
            const currentYear = this.getCurrentYear(yearIndex);

            if (currentYear === this.startYear) {
                if (month > this.startMonth) {
                    if (currentYear === this.endYear && month >= this.endMonth) {
                        return null;
                    }
                    return [this.cellWithinRange];
                }
            }
            if (currentYear === this.endYear) {
                if (month < this.endMonth) {
                    if (currentYear === this.startYear && month <= this.startMonth) {
                        return null;
                    }
                    return [this.cellWithinRange];
                }
            }
            if (currentYear > this.startYear && currentYear < this.endYear) {
                return [this.cellWithinRange];
            }

            return null;
        },
        getPickerControlClass(month, yearIndex) {
            const currentYear = this.getCurrentYear(yearIndex);
            const classes = [this.pickerControl];

            if (currentYear === this.startYear && month === this.startMonth) {
                classes.push(this.selected, this.isStartMonth);
            }
            if (currentYear === this.endYear && month === this.endMonth) {
                classes.push(this.selected, this.isEndMonth);
            }
            if (this.isFutureMonth(currentYear, month)) {
                classes.push("isDisabled");
            }

            return classes.join(" ");
        },
        onSelectMonth(newMonth, newYear, eventType) {
            if (this.isFutureMonth(newYear, newMonth)) {
                return;
            }
            let {
                selectingStart,
                startMonth,
                startYear,
                endMonth,
                endYear,
                yearContext,
            } = this; 

            if (selectingStart) {
                startMonth = newMonth;
                startYear = newYear;
                if (eventType === "click") {
                    yearContext = newYear; 
                    endMonth = startMonth 
                }
            } else {
                endMonth = newMonth;
                endYear = newYear;  
            }

            let nextState = {
                selectingStart,
                selectingEnd: this.selectingEnd,
                yearContext,
                startMonth,
                endMonth,
                startYear,
                endYear,
            };

            if (eventType === "click") {
                nextState = this.fixDates(nextState);
                if (selectingStart) {
                    nextState.selectingStart = false;
                    nextState.selectingEnd = true;
                }
            }

            Object.assign(this, nextState);

            if (eventType === "click") {
                this.setDates();
            }
        },
        onSelectYear(direction) {
            const oldYear = this.yearContext;
            const yearContext = direction === "increment" ? oldYear + 1 : oldYear - 1;
            let { startYear, endYear } = this;

            if (this.selectingStart) {
                startYear = yearContext;
            } else {
                endYear = yearContext;
            }

            const nextState = this.fixDates({
                selectingStart: this.selectingStart,
                selectingEnd: this.selectingEnd,
                yearContext,
                startMonth: this.startMonth,
                startYear,
                endMonth: this.endMonth,
                endYear,
            });

            Object.assign(this, nextState);
            this.setDates();
        },
        isFutureMonth(year, month) {
            if (!this.inactiveFutureMonth) return false;
            const now = new Date();
            const nowYear = now.getFullYear();
            const nowMonth = now.getMonth();
            return year > nowYear || (year === nowYear && month > nowMonth);
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
            this.closePicker();
        },
    },
    mounted() {
        document.addEventListener("mousedown", this.handleDocumentClick);
        document.addEventListener("touchstart", this.handleDocumentClick, { passive: true });
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
  display: inline-block;
  padding: 0.5em 12px 0.5em 0.5em;
  border: 1px solid #d1d5db;
  outline: none;
  transition: box-shadow 0.2s, border-color 0.2s;
  border-radius: 8px;
  background-color: #ffffff;
}
.termInput.active {
  border-color: var(--primaryColor);
  box-shadow: inset 0 -3px 0 var(--primaryColor);
}
.termInput .fa {
  color: var(--primaryColor);
}
.termInputControl {
  display: inline-block;
  min-width: 5em;
  padding: 6px 12px;
  text-align: center;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  color: #111827;
  cursor: pointer;
}
.termInputControl.selecting {
  color: white;
}
.termInputControl.selecting.isStartMonth {
  background-color: var(--primaryColor);
}
.termInputControl.selecting.isEndMonth {
  background-color: var(--primaryColor);
}

.picker {
  position: absolute;
  left: 0;
  top: 2.9em;
  min-width: 300px;
  padding: 12px 12px 48px 12px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  box-sizing: border-box;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
.pickerCaret {
  position: absolute;
  top: -0.9em;
  width: 1.5em;
  height: 1.5em;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABMCAMAAAC74XL0AAAA+VBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADw8PAAAADj4+MAAAAAAAAAAAAAAAAAAACxsbEAAAAAAACAgID39/d1dXVra2vMzMy+vr719fXw8PCdnZ2amprCwsK8vLy3t7e0tLTm5ubd3d3JycnHx8fX19fV1dXS0tL8/Pz39/fj4+Pf39/d3d3b29vq6urk5OTj4+P////y8vLr6+vp6en////u7u79/f36+vrx8fH5+fn39/f19fX////39/f+/v79/f37+/v6+vr5+fn////8/Pz////+/v7///+FGs6FAAAAUnRSTlMAAQIDBAUGBwgJCgsMDQ4PEBEREhITFBUWFxcYGSAhIyYoKzIzNDU/QUNER0pRUl9gYWFjbG5vcHp9foCHi4yQmqGjqbS2t8DG0dLT1NXg4/DxJjbxaAAAAtxJREFUeNrt2el6k0AUgGHTsIQdxEyCVMUtilqtW7QubTSaRqXGOfd/MTKheqoDHZbxR2K/G3gfeDgHJrl00f9U70zbwyG1cxqS28AVVL+vKGqeovT7BbkN3C9K03R9kKfrmqYoCG4qh5iq6rpp2raTZ1mGUYCbzvXyGDYYWJbr+n6Q53m2zcDigdlMjseCgJDRiJDh0Pc5cCO5nR1FYQ+J64YhIeNxlDcaDYfshg4Gqtrv9/I2jUNM00zTcdiNjKI43t2NYwaGoedZFgfK5Saz5XIxTWRzON6aZhiO4/vsRsYzWLdKi+tzXcvSdRx3yVyuFdFUNocjYNueNxzm1zaF362SKCIkCBzHNHGdSeVSCtiC5ySNt+eF4WgUJSdwtsN4PCbE9x0Hx10mt4A/25fG4Xiz1bXGokP4KzrJr48bd0ncHnBlCc/JGm8KfHM524XnkgzKeing2m6TOZT3gNsuMrgpVEQTjuu+TVKobBnjuOM4dOISCtXNeK7beEcncF776+1SfEyoKoJtuRmcG015rsM2eQWCTpLW24XnUgqiFu04HAHcJskKxL3hpq8tt4A67TXn8OhhGLZ9uk0OoVZ0wq4vCFwXX7YtuH2oWcZzLbYJhbrN4ygSvGxFXJJB/aYCTjxxc2gQTQXjIOIOoFGrpAGHL1R2rGLX9hgatqx+t4u5hELT3pdz4hdqFMUZNO8pt13qcnNoEb0r4ASngaZlpycHbhyEp4F2zXlOPALJCtp2sJ4+3+fHoZpbQvtSnqt8TIIAD43twk9B0yweFxH3BDqViTm8lYTcp9CtGSFhiMvsfO5GBl17UZfz/fAzdI7eCwJuVZdzr0FC366JOfbJ4DwCKX1ybZs9KgLuFgU5veM4/qffwdWvIKuHBsNwEMq4jyAtehO5ij8knoPEvuBfG+XcHZDahzIOwSs/QG7PECvhjkF2t5HjyCOQ3vfLDCvt+vE/6G3OXbQF/QSAiT/qMlFuagAAAABJRU5ErkJggg==);
  background-size: contain;
  background-repeat: no-repeat;
  transition: left 500ms;
}
.pickerControl {
  width: 2.9166666667em;
  height: 2.9166666667em;
  margin: 0 auto;
  font-size: 0.75em;
  font-weight: 600;
  line-height: 2.9166666667;
  cursor: pointer;
  transition: background-color 200ms, box-shadow 200ms;
}
.pickerControl.isDisabled {
  pointer-events: none;
  opacity: 0.4;
  cursor: not-allowed;
}
.pickerControlInner {
  border-radius: 50%;
  transition: background-color 200ms;
}
.pickerControlInner:hover {
  color: black;
}
 
.pickerControl.selected.isStartMonth .pickerControlInner {
  background-color: var(--primaryColor);
}
 
.pickerControl.selected.isEndMonth .pickerControlInner {
  background-color: var(--primaryColor);
}
.pickerControl.selected .pickerControlInner {
  color: white;
}
.picker th svg {
  display: block;
  width: 75%;
  margin: 0 auto;
  fill: #6b7280;
  cursor: pointer;
}
.picker th svg:hover {
  fill: #111827;
}
.picker .yearOneContext,
.picker .yearTwoContext {
  float: left;
  width: calc(50% - .25em);
}
.picker .yearOneContext table,
.picker .yearTwoContext table {
  width: 100%;
  border-collapse: collapse;
}
.picker .yearOneContext tr + tr td,
.picker .yearTwoContext tr + tr td {
  padding-top: 5px;
}
.picker .yearOneContext td, .picker .yearOneContext th,
.picker .yearTwoContext td,
.picker .yearTwoContext th {
  text-align: center;
  color: #4b5563;
  font-weight: normal;
}
.picker .yearOneContext th,
.picker .yearTwoContext th {
  font-size: 0.875em;
  letter-spacing: 2px;
}
.picker .yearOneContext td.cellWithinRange .pickerControl,
.picker .yearTwoContext td.cellWithinRange .pickerControl {
  color: #aaa;
}

.picker .yearTwoContext {
  margin-left: 0.5em;
}

.pickerFooter {
  position: absolute;
  right: 12px;
  bottom: 12px;
}

.pickerClose {
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.pickerClose:hover {
  background-color: #f9fafb;
  border-color: #cbd5f5;
}

.pickerClose:active {
  background-color: #f3f4f6;
}

.pickerSubmit {
  margin-left: 5px;
  border: 1px solid #d1d5db;
  background: var(--grad3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.pickerSubmit:hover {
  background-color: #f9fafb;
  border-color: #cbd5f5;
}

.pickerSubmit:active {
  background-color: #f3f4f6;
}
</style>
