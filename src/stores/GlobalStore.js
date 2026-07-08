class Store {
  deviceNames = {};
  pollingIntervals = {};
  data = {};
  lastPollingTimes = {};

  nextPollingTime(sn) {
    const last = this.lastPollingTimes[sn];
    const interval = (this.pollingIntervals[sn] ?? 10) * 1000;
    if (!last) return interval;
    const remaining = (last + interval) - Date.now();
    return (remaining > 0 ? remaining : interval) + 200;
  }
}

module.exports = { Store: new Store() };
