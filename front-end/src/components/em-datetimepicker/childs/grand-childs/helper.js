import momentJs from 'moment/moment';
export const moment = momentJs;

export const log = console.log;


// moment.tz.setDefault('Asia/Dhaka');

export function pad2 (num) {
  return String(num).padStart(2, '0');
}

export function clone (data, { remove = [], add = {}, only = [] } = {}) {
  if(!data || (typeof data  === 'string')) return data; 
  data = JSON.parse(JSON.stringify(data));

  if (typeof data === "object" && Array.isArray(data) === false) {
    // Delete keys
    if (remove?.length && Array.isArray(remove)) {
      remove.forEach((key) => {
        if (data.hasOwnProperty(key)) {
          delete data[key];
        }
      });
    }

    // keep only
    if (only?.length && Array.isArray(only)) {
      const new_data = {};
      only.forEach((key) => {
        if (data.hasOwnProperty(key)) {
          new_data[key] = data[key];
        }
      });
      data = new_data;
    }

    return { ...data, ...add };
  } else {
    return data;
  }
}

export function formatDate (date=new Date(), format = 'YYYY-MM-DD') {
  try {
      if (date) return moment(date).format(format);
  } catch(error) {
      return null;
  }
}

export function makeDate(date_or_time_objct_or_string, format = 'YYYY-MM-DD', { hour = 0, minute = 0, second=0, millisecond=0, all = false } = {}) {
  let dateTime = date_or_time_objct_or_string;
  if (!dateTime) return '';

  let date;

  if (dateTime instanceof Date) {
      // If it's already a Date object, use it directly
      date = moment(dateTime);
  } 
  else if (dateTime instanceof moment){
    date = date;
  }
  else if (typeof dateTime === 'string') {
      if (/^\d{1,2}:\d{1,2}\s?(AM|PM)?/i.test(dateTime)) {
          // If the input is a time string like "08:00 AM"
          let parts = dateTime.split(':');
          hour = parseInt(parts[0]);
          minute = parseInt(parts[1]);
          if (/PM/i.test(dateTime) && hour < 12) {
              hour += 12;
          } else if (/AM/i.test(dateTime) && hour === 12) {
              hour = 0;
          }
          // date = moment().set({ hour, minute, second: 0, millisecond: 0 });
          date = moment()
      } else if (/^\d{4}-\d{2}-\d{2}/.test(dateTime)) {
          // date string like "2024-07-13"
          date = moment(dateTime);
          if (/\d{1,2}:\d{1,2}\s?(AM|PM)?/i.test(dateTime)) {
            hour = date.hours();
            minute = date.minutes();
          }
      } else {
          // If the string is not in a recognized format, return an empty string
          return '';
      }
  } else {
      return '';
  }

  
  if (!date.isValid()) {
       return '';
  }

  date.set({ hour, minute, second, millisecond });

  let get_hours = date.hours();
  let details = {
      date: date.date(),
      month: date.month(),
      year: date.year(),
      hour: get_hours,
      minute: date.minutes(),
      second: date.seconds(),
      mode: get_hours >= 12 ? 'pm' : 'am',
      isAm: get_hours < 12,
  };

  if (all) {
      return { formatted: date.format(format), ...details };
  } else {
      return date.format(format);
  }
}



export function checkType(value) {
  const type = typeof value;

  if (type === 'symbol') {
    return 'symbol';
  } else if (type === 'object') {
    if (value === null) {
      return 'null';
    } else if (Array.isArray(value)) {
      return 'array';
    } else if (value instanceof RegExp) {
      return 'regexp';
    } else if (value instanceof HTMLElement) {
      return 'domElement';
    } else if (value instanceof Date) {
      return 'date';
    } else {
      return 'object';
    }
  } else {
    return type; // undefined, function, boolean
  }
}

export function isValidAvailableData(availableInDates){
  try {
    if(!availableInDates) return;
    let type = checkType(availableInDates);
    if(!availableInDates) return null;
    if(type === 'array' && availableInDates?.length && availableInDates?.every(item => ('date' in item))){
        availableInDates;
        return availableInDates;
    } else if(
        type === 'object' 
        && availableInDates?.aiasesKey?.date
        && availableInDates?.aiasesKey?.available 
        && availableInDates.data?.length
        ) {
            let _available = clone(availableInDates);
            _available.data.map(item => {
                item['date'] = item?.[availableInDates?.aiasesKey?.date] ?? item?.date;
                item['available'] = item?.[availableInDates?.aiasesKey?.available] ?? item?.available;
                return item;
            })
            return _available.data;
    } else {
        return null;
    }
  } catch (error) {
    
  }
}

export function ucfirst (str){
  if(!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}


// Don't export this please
const FORMATS = {
  date: 'YYYY-MM-DD', //YYYY-MM-DD HH:mm:ss
  weekday_short: 'ddd', 
};


export function isAvailableByDate(availableInDates, makeDate/**fn*/, {date}){
  let dates = isValidAvailableData(availableInDates);
  if(!dates?.length) return false;
  let exact_date = dates.filter(item => makeDate(item.date, FORMATS.date) == date)?.[0];
  return exact_date;
}

let timeout = null;

export function delay(callback, time=0) {
  clearTimeout(timeout);
  timeout = setTimeout(callback, time);
}
export function addMonth(date, qty=0) {
  return moment(date).add(qty, 'month').format('YYYY-MM-DD');
}

export function isInMinMaxDate (date, defaults) {
  const minDate = parseMinMaxDate(defaults.minDate);
  const maxDate = parseMinMaxDate(defaults.maxDate);

  if (!minDate && !maxDate) return true;

  if(minDate && maxDate){
      return moment(date).isBetween(minDate, maxDate, 'day', true);
  } 
  else if (minDate && !maxDate){           
      return moment(minDate).isSameOrBefore(date);
  }
  else if (!minDate && maxDate){
      return moment(maxDate).isSameOrAfter(date);
  }
}

export const withDate = {
  updateLocale: function({ lang='en', adjustWeekday=0 }={}){
    moment.updateLocale(lang, {
      week: {
        dow: adjustWeekday, // Monday is the first day of the week
      },
    });
  },  
  weekStartDate: function (date = new Date(), format = FORMATS.date) {
    return moment(date).startOf("week").format(format);
  },
  weekEndDate: function (date = new Date(), format = FORMATS.date) {
    return moment(date).endOf("week").format(format);
  },
  diffDays: function ({ start_date /*2024-02-03*/, end_date /*2024-02-07*/ }) {
    const startMoment = moment(new Date(start_date));
    const endMoment = moment(new Date(end_date));

    if (!startMoment.isValid() || !endMoment.isValid()) {
      console.error(
        'Invalid date format. Please provide dates in the format "YYYY-MM-DD".'
      );
      return null;
    }
    return endMoment.diff(startMoment, "days");
  },
  createWeekDays: function (date=new Date(), format=FORMATS.date) {
    return Array.from({length:7}).map((item, i)=>moment(moment(date).startOf('week')).add(i, 'day').format(format));
  },
}

export function parseMinMaxDate(date_pattern=''){
  if(!date_pattern) return '';
  if(moment(new Date(date_pattern)).isValid()){
    return moment(date_pattern).format(FORMATS.date);
  }

  /** It will use basically minDate and maxDate
   * === patterns =============================
   * 
   * 2024-12-15
   * today
   * today + 1 day|week|month
   * today - 1 day|week|month
   * yesterday
   * tomorrow
   * next Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday
   */

  const fromTomorrowAndNextWeekdays = function (format=FORMATS.date) {
    let tommorrow = moment().add(1, 'day')
    return Array.from({length:15}).map((item, i)=>moment(moment(tommorrow)).add(i, 'day').format(format));
  }
  

  let today_matched = /^Today$/ig.exec(date_pattern);
  let yesterday_matched = /^yesterday$/ig.exec(date_pattern);
  let tomorrow_matched = /^tomorrow$/ig.exec(date_pattern);
  let today_plus_something_matched = /^today ?(\+|\-) ?(\d+) ?(day|week|month)/ig.exec(date_pattern);
  let next_satSun_day_matched = /^next (Sat|Sun|Mon|Tue|Wed|Thu|Fri)/ig.exec(date_pattern);

  let result = '';

  if(today_matched){
    result = moment().format(FORMATS.date);
  }
  else if (yesterday_matched){
    result = moment().subtract(1, 'day').format(FORMATS.date);
  }
  else if (tomorrow_matched){
    result = moment().add(1, 'day').format(FORMATS.date);
  }
  else if (today_plus_something_matched){
    let [matches, sign, count, unit] = today_plus_something_matched;
    if(sign && count && unit){
      result = moment()[sign == '+' ? 'add' : 'subtract'](+count, unit).format(FORMATS.date);
    }
  }
  else if (next_satSun_day_matched){
    let day = next_satSun_day_matched[1];
    if(day){
      day = day.toLowerCase();
      let weekdays = fromTomorrowAndNextWeekdays();    
      let days = weekdays.map(date => ({date, day: moment(date).format(FORMATS.weekday_short)}));
      result = days.filter(item => item.day.toLowerCase() === day)[0].date;
    } 
  }
  return result;

}


export function createCustomeRanges(customRangePatters = [
  //===== Examples ===
  //========================
  //Note: Number is dynamic
  //========================
  // 'Today',
  // 'Tomorrow',
  // 'Yesterday',
  // 'Last 2 Days',
  // 'Next 3 Days',
  // '2 days',   ----- started from current day

  // 'This Week',
  // 'last week',
  // 'Next Week',
  // 'Last 2 Weeks',
  // '2 Weeks',   ----- started from current week

  // 'This Month',
  // 'last Month',
  // 'Next Month',
  // 'Last 2 Months',
  // 'Next 2 Months',
  // '2 Months',   ----- started from current month

  // 'This Year',
  // 'Last Year',
  // 'Next Year',
  // 'Last 2 Years',
  // 'Next 2 Years',
  // '2 Years',   ----- started from current year

  // 'January',
  // 'February',
  // 'March',
  // 'April',
  // 'May',
  // 'June',
  // 'July',
  // 'August',
  // 'September',
  // 'October',
  // 'November',
  // 'December',

  // All Months
  // Auto Months

  // :Custom tile here:2024-07-17:2024-07-17
  
]){
  if(!customRangePatters) return null;

  let default_list = [ 'This Week', 'Last Week', 'Next Week', 'This Month', 'Last Month', 'Next Month', 'Last 6 Months', 'Last Year', 'Auto Months', ];

  if(!Array.isArray(customRangePatters)){
    customRangePatters = default_list;
  }
  
  let result = customRangePatters.map(item => {
  
      const today_matched = /^Today$/ig.exec(item);
      const yesterday_matched = /^Yesterday$/ig.exec(item);
      const tomorrow_matched = /^Tomorrow$/ig.exec(item);

      // day
      const last_day_matched = /^Last (\d+) Days$/ig.exec(item);
      const next_day_matched = /^Next (\d+) Days$/ig.exec(item);
      const numbers_off_day_matched = /^(\d+) Days/ig.exec(item);

      // week
      const this_week_matched = /^This Week$/ig.exec(item);
      const exact_last_week_matched = /^Last Week$/ig.exec(item);
      const exact_next_week_matched = /^Next Week$/ig.exec(item);
      const last_week_matched = /^Last (\d+) Weeks/ig.exec(item);
      const next_week_matched = /^Next (\d+) Weeks/ig.exec(item);
      const numbers_off_week_matched = /^(\d+) Weeks/ig.exec(item);

      // month
      const this_month_matched = /^This Month$/ig.exec(item);
      const exact_last_month_matched = /^Last Month$/ig.exec(item);
      const exact_next_month_matched = /^Next Month$/ig.exec(item);
      const last_month_matched = /^Last (\d+) Months/ig.exec(item);
      const next_month_matched = /^Next (\d+) Months/ig.exec(item);
      const numbers_off_month_matched = /^(\d+) Months/ig.exec(item);

      // year
      const this_year_matched = /^This Year$/ig.exec(item);
      const exact_last_year_matched = /^Last Year$/ig.exec(item);
      const exact_next_year_matched = /^Next Year$/ig.exec(item);
      const last_year_matched = /^Last (\d+) Years/ig.exec(item);
      const next_year_matched = /^Next (\d+) Years/ig.exec(item);   
      const numbers_off_year_matched = /^Next (\d+) Years/ig.exec(item);  
      
      // :Custom tile here:2024-07-17:2024-07-17
      const custom_date_range_matched = /^: ?(.*):(\d{4}-\d{2}-\d{2}):(\d{4}-\d{2}-\d{2})/ig.exec(item);  

      const months_names = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
      ];

      if(today_matched){
          item = {
              label: item,
              startDate: moment().format(FORMATS.date),
              endDate: moment().format(FORMATS.date),
          }
      }        
      else if(yesterday_matched){
          item = {
              label: item,
              startDate: moment().subtract(1, 'day').format(FORMATS.date),
              endDate: moment().subtract(1, 'day').format(FORMATS.date),
          }
      }
      else if(tomorrow_matched){
          item = {
              label: item,
              startDate: moment().add(1, 'day').format(FORMATS.date),
              endDate: moment().add(1, 'day').format(FORMATS.date),
          }
      }    
      
      // day
      else if(last_day_matched){
          let count = Number(last_day_matched[1]);
          item = {
              label: item,
              startDate: moment().subtract(count, 'day').format(FORMATS.date),
              endDate: moment().subtract(1, 'day').format(FORMATS.date),
          }
      }
      else if(next_day_matched){
          let count = Number(next_day_matched[1]);
          item = {
              label: item,
              startDate: moment().add(1, 'day').format(FORMATS.date),
              endDate: moment().add(count, 'day').format(FORMATS.date),
          }
      }
      else if(numbers_off_day_matched){
          let count = Number(numbers_off_day_matched[1]);
          item = {
              label: item,
              startDate: moment().add(0, 'day').format(FORMATS.date),
              endDate: moment().add(count - 1, 'day').format(FORMATS.date),
          }
      }
      
      //  Week
      else if(this_week_matched){
          item = {
              label: item,
              startDate: moment().startOf('week').format(FORMATS.date),
              endDate: moment().endOf('week').format(FORMATS.date),
          }
      }
      else if(exact_last_week_matched){
          item = {
              label: item,
              startDate: moment().subtract(1, 'week').startOf('week').format(FORMATS.date),
              endDate: moment().subtract(1, 'week').endOf('week').format(FORMATS.date),
          }
      }
      else if(exact_next_week_matched){
          item = {
              label: item,
              startDate: moment().add(1, 'week').startOf('week').format(FORMATS.date),
              endDate: moment().add(1, 'week').endOf('week').format(FORMATS.date),
          }
      }
      else if(last_week_matched){
          let count = Number(last_week_matched[1]);
          item = {
              label: item,
              startDate: moment().subtract(count, 'week').startOf('week').format(FORMATS.date),
              endDate: moment().subtract(1, 'week').endOf('week').format(FORMATS.date),
          }
      }
      else if(next_week_matched){
          let count = Number(next_week_matched[1]);
          item = {
              label: item,
              startDate: moment().add(1, 'week').startOf('week').format(FORMATS.date),
              endDate: moment().add(count, 'week').endOf('week').format(FORMATS.date),
          }
      }
      else if(numbers_off_week_matched){
          let count = Number(numbers_off_week_matched[1]);
          item = {
              label: item,
              startDate: moment().add(0, 'week').startOf('week').format(FORMATS.date),
              endDate: moment().add(count - 1, 'week').endOf('week').format(FORMATS.date),
          }
      }

       
      //  month
      else if(this_month_matched){
          item = {
              label: item,
              startDate: moment().startOf('month').format(FORMATS.date),
              endDate: moment().endOf('month').format(FORMATS.date),
          }
      }
      else if(exact_last_month_matched){
          item = {
              label: item,
              startDate: moment().subtract(1, 'month').startOf('month').format(FORMATS.date),
              endDate: moment().subtract(1, 'month').endOf('month').format(FORMATS.date),
          }
      }
      else if(exact_next_month_matched){
          item = {
              label: item,
              startDate: moment().add(1, 'month').startOf('month').format(FORMATS.date),
              endDate: moment().add(1, 'month').endOf('month').format(FORMATS.date),
          }
      }
      else if(last_month_matched){
          let count = Number(last_month_matched[1]);
          item = {
              label: item,
              startDate: moment().subtract(count, 'month').startOf('month').format(FORMATS.date),
              endDate: moment().subtract(1, 'month').endOf('month').format(FORMATS.date),
          }
      }
      else if(next_month_matched){
          let count = Number(next_month_matched[1]);
          item = {
              label: item,
              startDate: moment().add(1, 'month').startOf('month').format(FORMATS.date),
              endDate: moment().add(count, 'month').endOf('month').format(FORMATS.date),
          }
      }
      else if(numbers_off_month_matched){
          let count = Number(numbers_off_month_matched[1]);
          item = {
              label: item,
              startDate: moment().add(0, 'month').startOf('month').format(FORMATS.date),
              endDate: moment().add(count - 1, 'month').endOf('month').format(FORMATS.date),
          }
      }


      //  year
      else if(this_year_matched){
          item = {
              label: item,
              startDate: moment().startOf('year').format(FORMATS.date),
              endDate: moment().endOf('year').format(FORMATS.date),
          }
      }
      else if(exact_last_year_matched){
          item = {
              label: item,
              startDate: moment().subtract(1, 'year').startOf('year').format(FORMATS.date),
              endDate: moment().subtract(1, 'year').endOf('year').format(FORMATS.date),
          }
      }
      else if(exact_next_year_matched){
          item = {
              label: item,
              startDate: moment().add(1, 'year').startOf('year').format(FORMATS.date),
              endDate: moment().add(1, 'year').endOf('year').format(FORMATS.date),
          }
      }
      else if(last_year_matched){
          let count = Number(last_year_matched[1]);
          item = {
              label: item,
              startDate: moment().subtract(count, 'year').startOf('year').format(FORMATS.date),
              endDate: moment().subtract(1, 'year').endOf('year').format(FORMATS.date),
          }
      }
      else if(next_year_matched){
          let count = Number(next_year_matched[1]);
          item = {
              label: item,
              startDate: moment().add(1, 'year').startOf('year').format(FORMATS.date),
              endDate: moment().add(count, 'year').endOf('year').format(FORMATS.date),
          }
      }
      else if(numbers_off_year_matched){
          let count = Number(numbers_off_year_matched[1]);
          item = {
              label: item,
              startDate: moment().add(1, 'year').startOf('year').format(FORMATS.date),
              endDate: moment().add(count - 1, 'year').endOf('year').format(FORMATS.date),
          }
      }

      // Direct Month Name
      else if(months_names.includes(item)){
        let montIndex = months_names.findIndex(i => i===item);
        if(montIndex > -1){
          let year = new Date().getFullYear();
          item = {
              label: item,
              startDate: moment().year(year).month(montIndex).startOf('month').format(FORMATS.date),
              endDate: moment().year(year).month(montIndex).endOf('month').format(FORMATS.date),
          }
        }
      } 
      // :custom label:2024-07-17:2024-07-28
      else if(custom_date_range_matched){ 
        if(custom_date_range_matched?.length == 4){
          let [match, label, startDate, endDate] = custom_date_range_matched;
          if(moment(startDate).isSameOrBefore(endDate)){
            item = {
                label,
                startDate: moment(startDate).format(FORMATS.date),
                endDate: moment(endDate).format(FORMATS.date),
            }
          } else {
            item = '';
          }
        } else {
          item = '';
        }
      } 
      else{
          let auto_months = 'Auto Months';
          let all_months = 'All Months';

          if(item === auto_months || item === all_months){
            let montIndex = months_names.findIndex(monthName => monthName === moment().format('MMMM'));
            if(item === all_months) montIndex = 11;
            let monthRanges = [];
            for(let i=0; i<= montIndex; i++){
              monthRanges.push({
                label: months_names[i],
                startDate: moment().year(new Date().getFullYear()).month(i).startOf('month').format(FORMATS.date),
                endDate: moment().year(new Date().getFullYear()).month(i).endOf('month').format(FORMATS.date),
              })
            }
            item = monthRanges;
          } else {
            item = null;
          }
      }

      return item;
  })

  return result.flat(1).filter(Boolean);
  
}

