export function isRoughly(val, expected, threshold = 0.01) {
  return Math.abs(val - expected) <= threshold;
}

