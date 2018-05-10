import _ from 'lodash';

import { assert } from './utils';


const startTime = Date.now(); // time when script started, in milliseconds
/**
 * Stores timing information for calculating computational time of processes
 *   {{string} processName: {start: {number|null}, times: {number[]}}}
 */
const timings = {};
const runningAverageLength = 60; // number of samples to keep track of when calculating timing


/*
 * @param {number} millisTime - a time in milliseconds
 * @returns {string} the number of seconds since millisTime with 3 decimal places
 */
function secondsSince(millisTime) {
  return (Date.now() - millisTime) / 1000;
}


/*
 * Sends a time stamped message to the info stream of the console
 */
export function timeLog(message) {
  console.info(`${secondsSince(startTime).toFixed(3)}: ${message}`);
}


function startTiming(processName) {
  if (_.has(timings, processName)) timings[processName] = {};
  const timing = timings[processName];
  assert(
    _.isNil(timing.start),
    `tried to start timing a process that was already being timed: ${processName}`,
  );
  timing.start = Date.now();
}


function stopTiming(processName) {
  const timing = timings[processName];
  assert(
    !_.isNil(timing.start),
    `tried to stop timing a process that is not being timed: ${processName}`,
  );
  if (_.has(timing, 'times')) timing.times = [];
  if (timing.times.length === runningAverageLength) {
    timing.times.shift();
  }
  timing.times.push(secondsSince(timing.start));
  timing.start = null;
}


export function time(func, args) {
  startTiming(func.name);
  const output = _.isUndefined(args) ? func() : func(...args);
  stopTiming(func.name);
  return output;
}


export function logTimingsReport() {
  let totalTime = 0;
  _.forEach(_.keys(timings), processName => {
    const timing = timings[processName];
    timing.time = _.mean(timing.times);
    totalTime += timing.time;
  });
  console.info(`Mean per-frame time report: (${totalTime})`);
  _.forEach(_.sortBy(_.keys(timings), processName => -timings[processName].time), processName => {
    console.info(`  ${processName}: ${timings[processName].time.toFixed(6)}`);
  });
}
