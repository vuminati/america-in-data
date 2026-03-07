/**
 * Select a random pair of items, enforcing:
 *   1. The two items must not share the same value for `pairingKey`
 *      (e.g. same HTS heading for imports, same major_group for jobs)
 *   2. Neither item should have appeared in the previous round (lastPair)
 *   3. The two items' values must not be identical (if valueKey provided)
 *   4. The two items' values must differ by at least 5% (if valueKey provided)
 *
 * Falls back gracefully if constraints can't be satisfied.
 *
 * @param {Array}        items      - Full item pool
 * @param {string}       pairingKey - Field name used to prevent same-group matches
 * @param {Array|null}   lastPair   - [item1, item2] from the previous round, or null
 * @param {string|null}  valueKey   - Field name of the numeric value to compare
 * @returns {Array} [item1, item2]
 */
export function selectPair(items, pairingKey, lastPair = null, valueKey = null) {
  const lastNames = lastPair
    ? new Set([lastPair[0].display_name, lastPair[1].display_name])
    : new Set()

  // Returns true if a and b differ by at least 5% and are not identical
  function differentEnough(a, b) {
    if (!valueKey) return true
    const va = Math.abs(a[valueKey])
    const vb = Math.abs(b[valueKey])
    if (va === vb) return false
    return Math.abs(va - vb) / Math.max(va, vb) >= 0.20
  }

  // Primary attempt: respect all constraints (pairing key, last pair, ≥5% diff)
  for (let attempt = 0; attempt < 300; attempt++) {
    const i = Math.floor(Math.random() * items.length)
    let j = Math.floor(Math.random() * items.length)
    while (j === i) j = Math.floor(Math.random() * items.length)

    const a = items[i]
    const b = items[j]

    if (a[pairingKey] === b[pairingKey]) continue
    if (lastNames.has(a.display_name) || lastNames.has(b.display_name)) continue
    if (!differentEnough(a, b)) continue

    return [a, b]
  }

  // Fallback 1: drop the last-pair constraint, keep pairing-key and ≥5% diff
  for (let attempt = 0; attempt < 200; attempt++) {
    const i = Math.floor(Math.random() * items.length)
    let j = Math.floor(Math.random() * items.length)
    while (j === i) j = Math.floor(Math.random() * items.length)

    const a = items[i]
    const b = items[j]

    if (a[pairingKey] === b[pairingKey]) continue
    if (!differentEnough(a, b)) continue

    return [a, b]
  }

  // Fallback 2: drop ≥5% rule but still exclude identical values and pairing-key
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (a[pairingKey] === b[pairingKey]) continue
      if (valueKey && a[valueKey] === b[valueKey]) continue
      return [a, b]
    }
  }

  // Last resort: return the first two items with different pairing-key values
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i][pairingKey] !== items[j][pairingKey]) return [items[i], items[j]]
    }
  }

  return [items[0], items[1]]
}

/**
 * Return the item with the higher value for the given key.
 * On a tie, item1 is returned (either answer would be correct).
 */
export function getCorrectItem(item1, item2, valueKey) {
  return item1[valueKey] >= item2[valueKey] ? item1 : item2
}

/**
 * Return true if the player's selected item is the correct (higher-value) one.
 * On a tie, either answer is considered correct.
 */
export function isCorrect(selectedItem, item1, item2, valueKey) {
  if (item1[valueKey] === item2[valueKey]) return true
  return selectedItem[valueKey] === getCorrectItem(item1, item2, valueKey)[valueKey]
}

// ─── Value formatters ──────────────────────────────────────────────────────────

/**
 * Format a dollar import value with abbreviated suffixes (k / M / B).
 * Always shows at least 2 significant digits:
 *   $4.2B, $19B, $525k
 */
export function formatValue(value) {
  const B = 1_000_000_000
  const M = 1_000_000
  const K = 1_000

  if (value >= B) {
    const v = value / B
    return '$' + (v < 10 ? v.toFixed(1) : Math.round(v)) + 'B'
  }
  if (value >= M) {
    const v = value / M
    return '$' + (v < 10 ? v.toFixed(1) : Math.round(v)) + 'M'
  }
  if (value >= K) {
    const v = value / K
    return '$' + (v < 10 ? v.toFixed(1) : Math.round(v)) + 'k'
  }
  return '$' + value.toLocaleString()
}

/**
 * Format a median hourly wage.  e.g. $39.27/hr
 */
export function formatWage(value) {
  return '$' + value.toFixed(2) + '/hr'
}

/**
 * Format a headcount with abbreviated suffixes (k / M), no dollar sign.
 * e.g. 3.8M, 278k, 1,380
 */
export function formatCount(value) {
  const M = 1_000_000
  const K = 1_000

  if (value >= M) {
    const v = value / M
    return (v < 10 ? v.toFixed(1) : Math.round(v)) + 'M'
  }
  if (value >= K) {
    const v = value / K
    return (v < 10 ? v.toFixed(1) : Math.round(v)) + 'k'
  }
  return value.toLocaleString()
}

/**
 * Return a formatted display string for an item's value,
 * based on the question type's formatType.
 */
/**
 * Format a CPI expenditure weight as a percentage of consumer spending.
 * e.g. 13.698 → "13.7% of spending", 0.293 → "0.29% of spending"
 */
export function formatPercent(value) {
  // Ensure at least 2 significant figures at every magnitude
  const d = value >= 1 ? 1 : value >= 0.1 ? 2 : value >= 0.01 ? 3 : 4
  return value.toFixed(d) + '% of spending'
}

/**
 * Format a median age in years.  e.g. 42.3 → "42.3 yrs"
 */
export function formatAge(value) {
  return value.toFixed(1) + ' yrs'
}

export function getDisplayValue(item, formatType, valueKey) {
  const v = item[valueKey]
  switch (formatType) {
    case 'currency': return formatValue(v)
    case 'wage':     return formatWage(v)
    case 'count':    return formatCount(v)
    case 'percent':  return formatPercent(v)
    case 'age':      return formatAge(v)
    default:         return String(v)
  }
}

// ─── Smart pair formatting ─────────────────────────────────────────────────────

/**
 * Format a single value at a specific number of decimal places,
 * keeping the correct suffix tier (B / M / k).
 */
function formatWithDecimals(value, formatType, decimals) {
  switch (formatType) {
    case 'currency': {
      const B = 1_000_000_000, M = 1_000_000, K = 1_000
      if (value >= B) return '$' + (value / B).toFixed(decimals) + 'B'
      if (value >= M) return '$' + (value / M).toFixed(decimals) + 'M'
      if (value >= K) return '$' + (value / K).toFixed(decimals) + 'k'
      return '$' + Math.round(value).toLocaleString()
    }
    case 'wage':
      return '$' + value.toFixed(decimals) + '/hr'
    case 'count': {
      const M = 1_000_000, K = 1_000
      if (value >= M) return (value / M).toFixed(decimals) + 'M'
      if (value >= K) return (value / K).toFixed(decimals) + 'k'
      return Math.round(value).toLocaleString()
    }
    case 'percent':
      return value.toFixed(decimals) + '% of spending'
    case 'age':
      return value.toFixed(decimals) + ' yrs'
    default: return String(value)
  }
}

/**
 * Format both values in a pair together, increasing decimal places until
 * the two display strings are distinct. This guarantees players can always
 * tell the numbers apart (e.g. "$5.63M" vs "$5.61M" instead of "$5.6M" twice).
 *
 * @returns {[string, string]} [displayValue1, displayValue2]
 */
export function formatPair(v1, v2, formatType) {
  // Determine minimum decimals needed for at least 2 significant figures
  let startDecimals
  if (formatType === 'wage') {
    startDecimals = 2
  } else if (formatType === 'percent') {
    // Use the smaller value to determine required precision
    const minVal = Math.min(Math.abs(v1), Math.abs(v2))
    startDecimals = minVal >= 1 ? 1 : minVal >= 0.1 ? 2 : minVal >= 0.01 ? 3 : 4
  } else {
    startDecimals = 1
  }
  for (let d = startDecimals; d <= 8; d++) {
    const s1 = formatWithDecimals(v1, formatType, d)
    const s2 = formatWithDecimals(v2, formatType, d)
    if (s1 !== s2) return [s1, s2]
  }
  // Ultimate fallback: raw numbers
  return [String(v1), String(v2)]
}
