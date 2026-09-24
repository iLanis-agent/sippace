// SipPace engine - hydration pacing math (no DOM)
(function (root) {
  'use strict';

  // Daily target: ~33 ml per kg body weight (common guidance midpoint).
  function targetMl(weightKg) {
    var w = Number(weightKg) || 0;
    if (w <= 0) return 2000; // sensible default
    return Math.round(w * 33);
  }

  // Day window: wakeHour to sleepHour (sleep may pass midnight, e.g. 7 -> 23 or 8 -> 1).
  function windowMinutes(wakeHour, sleepHour) {
    var w = Number(wakeHour), s = Number(sleepHour);
    if (isNaN(w) || isNaN(s)) return 16 * 60;
    var span = (s - w + 24) % 24;
    if (span === 0) span = 24;
    return span * 60;
  }

  function minutesSinceWake(now, wakeHour) {
    var wake = new Date(now.getTime());
    wake.setHours(Number(wakeHour), 0, 0, 0);
    if (wake.getTime() > now.getTime()) wake.setDate(wake.getDate() - 1);
    return Math.max(0, Math.round((now.getTime() - wake.getTime()) / 60000));
  }

  // How much you SHOULD have had by now, assuming even pacing across the waking window.
  function expectedByNow(target, wakeHour, sleepHour, now) {
    var span = windowMinutes(wakeHour, sleepHour);
    var elapsed = Math.min(minutesSinceWake(now, wakeHour), span);
    return Math.round(target * (elapsed / span));
  }

  // paceStatus: ratio of actual vs expected. ahead >=1.1, on-track 0.9-1.1, behind 0.5-0.9, dry <0.5
  function paceStatus(actualMl, expectedMl) {
    if (expectedMl <= 0) return 'on-track';
    var r = actualMl / expectedMl;
    if (r >= 1.1) return 'ahead';
    if (r >= 0.9) return 'on-track';
    if (r >= 0.5) return 'behind';
    return 'dry';
  }

  // Day totals from entries [{ml, at ISO}] for a given calendar day.
  function dayTotal(entries, day) {
    var key = day.toDateString();
    var sum = 0;
    entries.forEach(function (e) {
      if (new Date(e.at).toDateString() === key) sum += Number(e.ml) || 0;
    });
    return sum;
  }

  // Remaining and a suggested even-pour size for the rest of the day (target 8 pours).
  function remaining(target, actual) { return Math.max(0, target - actual); }
  function suggestedPour(target) {
    var p = Math.round((target / 8) / 50) * 50;
    return Math.max(150, Math.min(500, p));
  }

  // Streak: consecutive days (ending today or yesterday) meeting target.
  function streak(entries, targetFn, today) {
    var s = 0;
    for (var d = 0; d < 400; d++) {
      var day = new Date(today.getTime());
      day.setDate(day.getDate() - d);
      var t = targetFn(day);
      if (dayTotal(entries, day) >= t && t > 0) s++;
      else if (d === 0) continue; // today may still be in progress
      else break;
    }
    return s;
  }

  var api = { targetMl: targetMl, windowMinutes: windowMinutes, minutesSinceWake: minutesSinceWake,
    expectedByNow: expectedByNow, paceStatus: paceStatus, dayTotal: dayTotal,
    remaining: remaining, suggestedPour: suggestedPour, streak: streak };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SipEngine = api;
})(typeof self !== 'undefined' ? self : this);
