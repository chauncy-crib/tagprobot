import _ from 'lodash';

import { assert } from './utils';


const startTime = Date.now(); // time when script started, in milliseconds
const timings = {}; // stores timing information for calculating computational time of processes
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
  if (_.isUndefined(timings[processName])) timings[processName] = {};
  assert(
    _.isNil(timings[processName].start),
    `tried to start timing a process that was already being timed: ${processName}`,
  );
  timings[processName].start = Date.now();
}


function stopTiming(processName) {
  assert(
    !_.isNil(timings[processName].start),
    `tried to stop timing a process that is not being timed: ${processName}`,
  );
  if (_.isUndefined(timings[processName].times)) timings[processName].times = [];
  if (timings[processName].times.length === runningAverageLength) {
    timings[processName].times.shift();
  }
  timings[processName].times.push(secondsSince(timings[processName].start));
  timings[processName].start = null;
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
    timings[processName].time = _.mean(timings[processName].times);
    totalTime += timings[processName].time;
  });
  console.info(`Timings Report: (${totalTime})`);
  _.forEach(_.sortBy(_.keys(timings), processName => -timings[processName].time), processName => {
    console.info(`  ${processName}: ${timings[processName].time.toFixed(6)}`);
  });
}
