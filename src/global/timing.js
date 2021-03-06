import _ from 'lodash';

import { assert } from './utils';


let loopCount = 0; // keep track of how many times we have run loop()
let lastTimeLogTime = Date.now(); // the last time timeLog() was called, in milliseconds
/**
 * Stores timing information for calculating computational time of processes
 *   {{string} processName: {start: {number|undefined}, times: {number[]}}}
 */
const timings = {};
export const TIMING_RUN_AVG_LEN = 180; // number of samples to hold on to when calculating timing


export function getLoopCount() {
  return loopCount;
}


export function incrementLoopCount() {
  loopCount += 1;
}


export function time() {
  return Date.now();
}


/**
 * @param {number} millisTime - a time in milliseconds
 * @returns {string} the number of seconds since millisTime with 3 decimal places
 */
export function secondsSince(millisTime) {
  return (time() - millisTime) / 1000;
}


export function resetStartTime() {
  lastTimeLogTime = time();
}


/**
 * Sends a time stamped message to the info stream of the console
 */
export function timeLog(message, baseTime = lastTimeLogTime) {
  console.debug(`${secondsSince(baseTime).toFixed(3)}: ${message}`);
  resetStartTime();
}


/**
 * Stores the current time under timings[procesName].start
 * @param {string} processName
 */
function startTiming(processName) {
  _.defaults(timings, { [processName]: { start: null } });
  const timing = timings[processName];
  assert(
    _.isNull(timing.start),
    `tried to start timing a process that was already being timed: ${processName}`,
  );
  timing.start = time();
}


/**
 * Stops timing processName and pushes the calculated time to an array of times to be used for a
 *   running average
 * @param {string} processName
 */
function stopTiming(processName) {
  assert(
    _.has(timings, processName) && !_.isNull(timings[processName].start),
    `tried to stop timing a process that is not being timed: ${processName}`,
  );
  const timing = timings[processName];
  _.defaults(timing, { times: {} });
  const { times } = timing;
  _.defaults(times, { [loopCount]: 0.0 });
  if (times.length === TIMING_RUN_AVG_LEN) {
    delete times[_.min(_.keys(times))];
  }
  times[loopCount] += secondsSince(timing.start);
  timing.start = null;
}


/**
 * Times func and stores timing information in timings
 * @param {function} func - a function to time
 * @param {[]} args - the arguments to pass to func
 * @returns - the return from calling func with args
 */
export function timeFunc(func, args = []) {
  startTiming(func.name);
  const output = func(...args);
  stopTiming(func.name);
  return output;
}


export function logTimingsReport() {
  let totalTime = 0;
  _.forEach(timings, timing => {
    timing.time = _.mean(_.values(timing.times));
    totalTime += timing.time;
  });
  console.debug(`Mean per-loop time report: avg(${totalTime.toFixed(6)})`);
  _.forEach(_.sortBy(_.keys(timings), processName => -timings[processName].time), processName => {
    const { time: avgTime, times } = timings[processName];
    const name = processName.padEnd(34);
    const avg = avgTime.toFixed(6);
    const max = _.max(_.values(times)).toFixed(6);
    console.debug(`  ${name}: avg(${avg}), max(${max})`);
    timings[processName].times = {};
  });
}
