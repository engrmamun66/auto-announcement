const TIME_ADJUSTMENT_MODE_DURATION_MS = 10 * 1000;

class Store {
  deviceNames = {};
  pollingIntervals = {};
  data = {};
  lastPollingTimes = {};
  timeAdjustmentModeExpiry = {}; // sn -> timestamp (ms) when the calibration window closes
  timeAdjustmentModeTimers = {}; // sn -> setTimeout handle that auto-disables it

  nextPollingTime(sn) {
    const last = this.lastPollingTimes[sn];
    const interval = (this.pollingIntervals[sn] ?? 10) * 1000;
    if (!last) return interval;
    const remaining = (last + interval) - Date.now();
    return (remaining > 0 ? remaining : interval) + 200;
  }

  enableTimeAdjustmentMode(sn) {
    clearTimeout(this.timeAdjustmentModeTimers[sn]);
    this.timeAdjustmentModeExpiry[sn] = Date.now() + TIME_ADJUSTMENT_MODE_DURATION_MS;
    this.timeAdjustmentModeTimers[sn] = setTimeout(() => this.clearTimeAdjustmentMode(sn), TIME_ADJUSTMENT_MODE_DURATION_MS);
  }

  isInTimeAdjustmentMode(sn) {
    const expiry = this.timeAdjustmentModeExpiry[sn];
    return Boolean(expiry && expiry > Date.now());
  }

  clearTimeAdjustmentMode(sn) {
    clearTimeout(this.timeAdjustmentModeTimers[sn]);
    delete this.timeAdjustmentModeTimers[sn];
    delete this.timeAdjustmentModeExpiry[sn];
  }
}

module.exports = { Store: new Store() };
