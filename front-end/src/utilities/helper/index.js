import moment from 'moment/moment';
import { useRoute, useRouter } from "vue-router";

const __i18nState = {
  code: 'en',
  packs: {
    en: {},
    bn: {},
  },
  textNodeOriginals: new WeakMap(),
  attrOriginals: new WeakMap(),
}

function sortDictionaryEntries(dictionary = {}) {
  return Object.entries(dictionary || {})
    .filter(([from, to]) => from && typeof to === 'string')
    .sort((a, b) => String(b[0]).length - String(a[0]).length)
}

function applyDictionary(text = '', dictionary = {}) {
  let result = String(text ?? '')
  sortDictionaryEntries(dictionary).forEach(([from, to]) => {
    if (from && from !== to && result.includes(from)) {
      result = result.split(from).join(to)
    }
  })
  return result
}

function canonicalizeText(text = '') {
  let result = String(text ?? '')

  Object.entries(__i18nState.packs || {}).forEach(([code, pack]) => {
    if (code === 'en') return

    const reversePack = Object.fromEntries(
      Object.entries(pack || {})
        .filter(([enText, localizedText]) => localizedText && localizedText !== enText)
        .map(([enText, localizedText]) => [localizedText, enText])
    )

    result = applyDictionary(result, reversePack)
  })

  return result
}

function replaceTemplateParams(template = '', params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    return params?.[key] ?? `{${key}}`
  })
}

const helper = { 
    log: console.log,
    setLanguage({ code = 'en', packs = {}, strings = {} } = {}) {
      const nextCode = code === 'bn' ? 'bn' : 'en'
      const nextPacks = { ...(__i18nState.packs || {}), ...(packs || {}) }

      if (strings && Object.keys(strings).length) {
        nextPacks[nextCode] = strings
      }

      if (!nextPacks.en) nextPacks.en = {}
      if (!nextPacks.bn) nextPacks.bn = {}

      __i18nState.code = nextCode
      __i18nState.packs = nextPacks
    },
    getLanguageCode() {
      return __i18nState.code
    },
    t(text = '', params = {}) {
      if (text === null || text === undefined) return ''

      if (typeof text === 'object' && !Array.isArray(text)) {
        return helper.localizedText(text, params)
      }

      const canonical = canonicalizeText(String(text))
      const translated = __i18nState.code === 'en'
        ? applyDictionary(canonical, __i18nState.packs.en || {})
        : applyDictionary(canonical, __i18nState.packs[__i18nState.code] || {})

      return replaceTemplateParams(translated, params)
    },
    localizedText(value = '', params = {}) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const selected = __i18nState.code === 'bn'
          ? (value.bn || value.en || '')
          : (value.en || value.bn || '')
        return replaceTemplateParams(selected, params)
      }

      return helper.t(String(value ?? ''), params)
    },
    canonicalText(value = '') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value.en || value.bn || ''
      }

      return canonicalizeText(String(value ?? ''))
    },
    optionTitleKey(option = {}) {
      return option?.title_key || helper.canonicalText(option?.title || '')
    },
    optionTitleLabel(option = {}) {
      return option?.title_label || helper.localizedText(option?.title || option?.title_key || '')
    },
    localizeReason(reason = '', options = []) {
      const canonicalReason = helper.canonicalText(reason)
      const matched = (options || []).find((option) => {
        return helper.optionTitleKey(option) === canonicalReason
      })

      if (matched) {
        return helper.optionTitleLabel(matched)
      }

      return helper.t(canonicalReason)
    },
    localizeDom(root = document.body) {
      if (typeof window === 'undefined' || !root) return

      const treeWalker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node?.parentElement
            if (!parent) return NodeFilter.FILTER_REJECT
            if (!String(node?.nodeValue || '').trim()) return NodeFilter.FILTER_REJECT
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT
            }
            if (parent.closest?.('[data-no-auto-i18n="true"]')) {
              return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
          },
        }
      )

      let currentNode = null
      while ((currentNode = treeWalker.nextNode())) {
        const original = __i18nState.textNodeOriginals.get(currentNode) ?? currentNode.nodeValue
        if (!__i18nState.textNodeOriginals.has(currentNode)) {
          __i18nState.textNodeOriginals.set(currentNode, original)
        }

        const translated = helper.t(original)
        if (translated !== currentNode.nodeValue) {
          currentNode.nodeValue = translated
        }
      }

      const translatableElements = []
      if (root instanceof Element) {
        translatableElements.push(root)
        translatableElements.push(...root.querySelectorAll('[placeholder],[title],[tooltip],[aria-label]'))
      }

      translatableElements.forEach((element) => {
        if (!(element instanceof Element)) return

        let cache = __i18nState.attrOriginals.get(element)
        if (!cache) {
          cache = {}
          __i18nState.attrOriginals.set(element, cache)
        }

        ;['placeholder', 'title', 'tooltip', 'aria-label'].forEach((attr) => {
          if (!element.hasAttribute(attr)) return
          if (!(attr in cache)) {
            cache[attr] = element.getAttribute(attr) || ''
          }

          const translated = helper.t(cache[attr])
          if (translated !== element.getAttribute(attr)) {
            element.setAttribute(attr, translated)
          }
        })
      })
    },
    goto: function(payload){
      let route = null
      let router = null
      try {
        route = useRoute()
        router = useRouter()
      } catch (e) {}

      if (!router && globalThis.__app_router) {
        router = globalThis.__app_router
        route = router?.currentRoute?.value || null
      }

      if (!router) return
      let dev = route?.query?.dev === 'true'
      if(dev) payload.query = { ...(payload.query || {}), dev: true} 
      router.push(payload)
    },
    listGroupBy: function (array, property) {
      if (!array?.length || !property) return {};
      return array.reduce((result, obj) => {
        const key = obj[property];
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(obj);
        return result;
      }, {});
    },
    randomBetween: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }, 
    wait: function(ms = 1000) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    copyToClipboard: function(text='', {el=null}={}) {
      if(text){
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
        } catch (err) {
            console.error("Failed to copy text", err);
        }
        document.body.removeChild(textarea);
        if(el && el instanceof HTMLElement){
          el.setAttribute('tooltip', 'copied');
          setTimeout(() => {
            el.setAttribute('tooltip', 'copy');          
          }, 1000);
        }
      }
    },
    localStorage: function (name, __defaultValue=undefined) {
      return {
        get value() {
          if (typeof process == "undefined") {
            var process = { client: true };
          }
          if (process.client && globalThis.localStorage) {
            let data = globalThis.localStorage.getItem(name);
            if(!data) return __defaultValue

            let parts = data.split('::')
            let type = 'string'
            if(parts.length > 1){
              type = parts[0]
              data = parts.slice(1).join('')
            }


            if (
              (data && data?.startsWith("{") && data?.endsWith("}")) ||
              (data?.startsWith("[") && data?.endsWith("]"))
            ) {
              data = JSON.parse(data);
            }
            if(type == 'boolean'){
              return data === 'true' ? true : false
            }
            else if(type == 'number'){
              return Number(data)
            }
            else  {
              return data;
            }
          }
        },
        set value(value) {

          let type = typeof value
          if (typeof process == "undefined") {
            var process = { client: true };
          }
          if (process.client && globalThis.localStorage) {
            if(value === null || value === ''){
              localStorage.removeItem(name)
            } else {
              if (value && typeof value === "object") {
                value = JSON.stringify(value);
              }
              let prefix = `${type}::`
              localStorage.setItem(name, prefix + value);
            }
          }
        },
      };
    }, 
    time_in_miliseconds: function(time_24=''){
      let [hours, minutes] = time_24.split(":")      
      
      let time_current= new Date().getTime()// - new Date().getMilliseconds()

      let dateObj = new Date()
      
      dateObj.setHours(parseInt(hours))
      dateObj.setMinutes(parseInt(minutes))
      dateObj.setSeconds(0)
      
      let time_future = dateObj.getTime()
      let miliseconds = Math.ceil(time_future - time_current)
      if(time_future > time_current){
          return miliseconds;
      } else {
          return 0
      } 
    }, 
    clone: function (data, { remove = [], add = {}, only = [] } = {}) {
      data = JSON.parse(JSON.stringify(data));
  
      if (data && typeof data === "object" && Array.isArray(data) === false) {
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
    },
    delay: function (callback, time = 0, ...args) {
      setTimeout(() => {
        callback(...args);
      }, time);
    },
    // with Time
    // with Time
    // with Time
    // with Time
    miliseconds: function (time_24 = '') {
      let momentObject = moment();

      if (time_24) {
        time_24 = moment(time_24, ['HH:mm', 'hh:mm A'], true).format('HH:mm')
        const [hours, minutes] = time_24.split(":").map(Number);

        if (!isNaN(hours) && !isNaN(minutes)) {
          momentObject.hour(hours);
          momentObject.minute(minutes);
          momentObject.second(0);
          momentObject.millisecond(0);
        }
      }

      return momentObject.valueOf(); // returns timestamp in milliseconds
    }
    ,
    formatTime: function(time_24){
      if(/^\d{2}:\d{2}$/.test(time_24)){
        return moment(time_24, 'HH:mm').format('hh:mm A')
      } else {
        return moment(time_24, 'hh:mm A').format('hh:mm A')
      }
    },
    ms_to_hour_minute: function (milliseconds = 23434) {
      const totalSeconds = Math.floor(milliseconds / 1000); // Convert milliseconds to seconds
      const totalMinutes = Math.floor(totalSeconds / 60); // Convert seconds to minutes
      const hours = Math.floor(totalMinutes / 60); // Get the total hours
      const minutes = totalMinutes % 60; // Get the remaining minutes
      const seconds = totalSeconds % 60; // Get the remaining seconds
    
      let str = [];
      if (hours) str.push(hours + 'h');
      if (minutes) str.push(minutes + 'm');
      if (seconds) str.push(seconds + 's');
    
      return str.join(' ');
    },
    ucfirst: (str) => {
      if(!str) return ''
      str = String(str);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    },
    wordForm: function (word, number) {
      if (number >= -1 && number <= 1) return word;
      else return `${word}s`;
    },
    enToBnDate: function(dateText='', {bold=false}={}){
      dateText = String(dateText)
      let lang = {
        '0': '০',
        '1': '১',
        '2': '২',
        '3': '৩',
        '4': '৪',
        '5': '৫',
        '6': '৬',
        '7': '৭',
        '8': '৮',
        '9': '৯',
        January: 'জানুয়ারি',
        February: 'ফেব্রুয়ারি', 
        March: 'মার্চ', 
        April: 'এপ্রিল', 
        May: 'মে', 
        June: 'জুন', 
        July: 'জুলাই', 
        August: 'আগস্ট', 
        September: 'সেপ্টেম্বর', 
        October: 'অক্টোবর', 
        November: 'নভেম্বর', 
        December: 'ডিসেম্বর',
        Sunday: 'রবিবার',
        Monday: 'সোমবার',
        Tuesday: 'মঙ্গলবার',
        Wednesday: 'বুধবার',
        Thursday: 'বৃহস্পতিবার',
        Friday: 'শুক্রবার',
        Saturday: 'শনিবার',
        day: 'দিন',
        days: 'দিন',
      }
      if(bold){
        dateText = Array.from(dateText).map(letter => lang?.[letter] ? `<strong class="bloder-text">${lang?.[letter]}</strong>` : letter).join('')
        dateText = dateText.split(' ').map(word => {
          let trimmedWord = word.replace(/,$/g, '')
          let end_comma = /,$/g.test(word) ? ',' : ''
          return lang?.[trimmedWord] ? `<stong class="bloder-text">${lang?.[trimmedWord]}${end_comma}</stong>` : word
        }).join(' ')
      } else {
        dateText = Array.from(dateText).map(letter => lang?.[letter] ? lang?.[letter] : letter).join('')
        dateText = dateText.split(' ').map(word => {
          let trimmedWord = word.replace(/,$/g, '')
          let end_comma = /,$/g.test(word) ? ',' : ''
          return lang?.[trimmedWord] ? (lang?.[trimmedWord] + end_comma) : word
        }).join(' ')
      }
      return dateText

    },
    getShifts: function(classes, class_short, as_message){
      let shifts = classes.find(cls => cls.class_short == class_short)?.shifts || []
      if(as_message){
        return shifts.map(s => s.start + ' - ' + s.end).join(', ')
      } else {
        return shifts
      }
    },
    uniqueArray(arr) {
      return [...new Set(arr)];
    },
    // ====================================================== //
    // ================= With Full Calendar ================= //
    // ====================================================== //

    createDateRange(
      startDate = moment().startOf('month').subtract(10, 'days').format('YYYY-MM-DD'), 
      endDate = moment().endOf('month').add(10, 'days').format('YYYY-MM-DD')) {
      const start = moment(startDate);
      const end = moment(endDate);
      const range = [];

      while (start.isSameOrBefore(end)) {
        range.push(start.format('YYYY-MM-DD'));
        start.add(1, 'day');
      }
      return range;
    },
    createWeekdayEvent(date=moment().format('YYYY-MM-DD')) { 
      return ({
        title: helper.t('Weekend'),
        start: date,
        allDay: true,
        display: 'background', // "auto" | "block" | "background" | "inverse-background" | "none"
        classNames: ['calendar-weekday-bg'],
        editable: false,
        overlap: false,
        constraint: 'meetingSlot', // this is group ID as my widh=
        constraint: { start: '2025-10-10', end: '2025-10-20' },
        __isWeekend: true,
      })
    },
    createVacationEvent(start_date, end_date, vacations, reason, {backgroundColor='#e74a3b', class__short=null, student=null}={}){
      let class_shorts = vacations.map(v => v.class_short) 
      let unique_class_shorts = helper.uniqueArray(class_shorts)
      const localizedReason = helper.localizedText(reason)
      let event = {
        title: localizedReason,
        start: start_date,
        end: moment(end_date).add(1, 'day').format('YYYY-MM-DD'), // 1 din na barale calndar e shesh din ta dekhabe na
        allDay: true,
        display: 'block',
        editable: false,
        overlap: true,
        constraint: localizedReason, // this is group ID as my widh=
        backgroundColor,
        // Extra data
        tooltip: `${localizedReason} (${unique_class_shorts?.length} ${helper.t(unique_class_shorts.length > 1 ? 'Classes' : 'Class')})`,
        vacations: vacations || [],
      }
      if(class__short){
        event.title = `${localizedReason} - ${class__short}`
        event.tooltip = `${localizedReason} (${class__short})`
      }
      if(student?.name){
        event.title = localizedReason
        event.tooltip = `${localizedReason} (${student?.name})`
      }
      return event
       
    },
    // =============== End With Full Calendar =============== //
    // ====================================================== //

     
}

export default helper
 
