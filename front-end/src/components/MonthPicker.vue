<template>
    <div :class="[termInput, selectingStart || selectingEnd ? active : '']" tabindex="-1" @blur="closePicker">
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

        <div v-if="picking || true" :class="picker" class="d-flex">
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
                                <div @click="
                                    onSelectMonth(month, getCurrentYear(yearIndex), 'click')
                                    " @mouseenter="
                    onSelectMonth(month, getCurrentYear(yearIndex), 'hover')
                    " :class="getPickerControlClass(month, yearIndex)">
                                    <div :class="pickerControlInner">
                                        {{ months[month] }}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
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
        endName: {
            type: String,
            default: "end",
        },
        defaultEndValue: {
            type: String,
            default: null,
        },
        dayOfMonth: {
            type: Number,
            default: 1,
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

            return classes.join(" ");
        },
        onSelectMonth(newMonth, newYear, eventType) {
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
                    // Since they are selecting the start month,
                    // Go ahead and give them an end month that
                    // is 11 months later
                    endMonth = (startMonth + 11) % 12;
                    endYear = endMonth === 11 ? startYear : startYear + 1;
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
                if (!selectingStart) {
                    setTimeout(() => {
                        this.selectingStart = false;
                        this.selectingEnd = false;
                    }, 200);
                }
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
                // Do not let the start year go past the end year
                if (startYear > endYear) {
                    endYear++;
                }
                // If they're now on the same year,
                // do not let the end month be before the start month
                if (startYear === endYear && startMonth >= endMonth) {
                    endMonth = (startMonth + 1) % 12;
                    //If this puts the end month in January, increment the year 1 as well
                    if (endMonth === 0) endYear++;
                }
            } else {
                // Must be selecting end month
                // Do not let the end year go before the start year
                if (endYear < startYear) {
                    startYear--;
                }
                // If they're now on the same year,
                // do not let the start month be after the end month
                if (startYear === endYear && startMonth >= endMonth) {
                    startMonth = (endMonth + 11) % 12;
                    //If this puts the start month in December, decrement the year 1 as well
                    if (startMonth === 11) startYear--;
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
                this.startValue = `${startYear}-${pad(
                    "00",
                    startMonth + 1,
                    true
                )}-${pad("00", dayOfMonth, true)}`;
                this.onChange({
                    target: { name: this.startName, value: this.startValue },
                });
            }
            if (field === "end" || field === "all") {
                this.endValue = `${endYear}-${pad("00", endMonth + 1, true)}-${pad(
                    "00",
                    dayOfMonth,
                    true
                )}`;
                this.onChange({ target: { name: this.endName, value: this.endValue } });
            }
        },
    },
    watch: {
        startValue(newVal) {
            this.onChange({ target: { name: this.startName, value: newVal } });
        },
        endValue(newVal) {
            this.onChange({ target: { name: this.endName, value: newVal } });
        },
    },
};
</script>

<style scoped>
/* Add your CSS styles here */
.termInput {
    position: relative;
    display: inline-block;
}

.termInputControl {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
}

.termInputControl:hover {
    background-color: #f0f0f0;
}

.selecting {
    background-color: #e0e0e0;
}

.picker {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 16px;
    margin-top: 8px;
}

.pickerCaret {
    position: absolute;
    top: -6px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #ddd;
}

.yearOneContext,
.yearTwoContext {
    display: inline-block;
    vertical-align: top;
    margin: 0 8px;
}

.pickerControl {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    margin: 2px;
}

.pickerControl:hover {
    background-color: #f0f0f0;
}

.selected {
    background-color: #007bff;
    color: white;
}

.isStartMonth {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.isEndMonth {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.cellWithinRange {
    background-color: #e8f4fd;
}

.pickerControlInner {
    min-width: 40px;
    text-align: center;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 4px !important;
    text-align: center;
}

th svg {
    width: 12px;
    height: 12px;
    cursor: pointer;
}

th svg:hover {
    opacity: 0.7;
}

.active {
    z-index: 1001;
}
</style>
