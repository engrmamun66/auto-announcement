const moment = require('moment');
const SunCalc = require('SunCalc');

const dhakaLocation = {
  lat: 23.8103,
  lng: 90.4125
};

function getDayMoment(time = '') {
  const times = SunCalc.getTimes(new Date(), dhakaLocation.lat, dhakaLocation.lng);
  const sunrise = moment(times.sunrise);
  const sunset = moment(times.sunset);

  let t = moment(time, ['HH:mm:ss']);
  let hour = t.hour();

  const sunrise_1hour_after = sunrise.clone().add(1, 'hour');
  const sunset_20_min_before = sunset.clone().subtract(20, 'minutes');
  const sunset_19_min_before = sunset.clone().subtract(19, 'minutes');

  const is_after_sunrise = t.isAfter(sunrise);
  const is_before_sunrise_1hour = t.isBefore(sunrise_1hour_after);
  const before_20_min_sunset = t.isBefore(sunset_20_min_before);
  const before_19_min_sunset = t.isBefore(sunset_19_min_before);

  if (is_after_sunrise && is_before_sunrise_1hour) return `ভোর`;
  else if (hour < 11) return `সকাল`;
  else if (hour < 15) return `দুপুর`;
  else if (hour >= 15 && before_20_min_sunset) return `বিকাল`;
  else if (!before_20_min_sunset && before_19_min_sunset) return `সন্ধ্যা`;
  else return `রাত্র`;
}

function formatTimeWithPeriod(timeString) {
  const period = getDayMoment(timeString);
  const time = moment(timeString, ['HH:mm:ss']).locale('bn').format('hh:mm A');
  // return `${period} - ${time}`;
  return `${time}`;
}

function formatDate(date) {
  return moment(date || '').locale('bn').format('DD MMMM, YYYY')
}

module.exports = {
  getDayMoment,
  formatDate,
  formatTimeWithPeriod,
};
