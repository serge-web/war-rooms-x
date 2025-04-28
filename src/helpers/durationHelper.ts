// Using native Date handling instead of external libraries

export interface TimeUnit {
  value: string
  label: string
  iso: string
}

export const timeUnits: TimeUnit[] = [
  { value: 'seconds', label: 'Seconds', iso: 'S' },
  { value: 'minutes', label: 'Minutes', iso: 'M' },
  { value: 'hours', label: 'Hours', iso: 'H' },
  { value: 'days', label: 'Days', iso: 'D' }
]

/**
 * Parse an ISO 8601 duration string into quantity and unit
 * @param isoDuration ISO 8601 duration string (e.g., 'PT30M', 'P1D')
 * @returns Object containing quantity and unit
 */
export const parseDuration = (isoDuration: string): { quantity: number; unit: string } => {
  // Handle empty input
  if (!isoDuration) {
    return { quantity: 1, unit: 'hours' }
  }

  // Legacy format - assume minutes if it's just a number
  const numericValue = parseInt(isoDuration)
  if (!isNaN(numericValue) && numericValue.toString() === isoDuration) {
    return { quantity: numericValue, unit: 'minutes' }
  }

  try {
    // Parse ISO 8601 duration format
    // Format: P[nY][nM][nD][T[nH][nM][nS]]
    const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/
    const matches = isoDuration.match(regex)

    if (!matches) {
      return { quantity: 1, unit: 'hours' }
    }

    const days = matches[1] ? parseInt(matches[1]) : 0
    const hours = matches[2] ? parseInt(matches[2]) : 0
    const minutes = matches[3] ? parseInt(matches[3]) : 0
    const seconds = matches[4] ? parseInt(matches[4]) : 0

    // Determine the most significant unit
    if (days > 0) {
      return { quantity: days + (hours / 24), unit: 'days' }
    } else if (hours > 0) {
      return { quantity: hours + (minutes / 60), unit: 'hours' }
    } else if (minutes > 0) {
      return { quantity: minutes + (seconds / 60), unit: 'minutes' }
    } else if (seconds > 0) {
      return { quantity: seconds, unit: 'seconds' }
    }

    return { quantity: 0, unit: 'minutes' }
  } catch {
    // Return default values if parsing fails
    return { quantity: 0, unit: 'minutes' }
  }
}

/**
 * Format quantity and unit into an ISO 8601 duration string
 * @param quantity Numeric value
 * @param unit Time unit (seconds, minutes, hours, days)
 * @returns ISO 8601 duration string
 */
export const formatDuration = (quantity: number, unit: string): string => {
  const unitInfo = timeUnits.find(u => u.value === unit)
  if (!unitInfo) return 'PT1H' // Default to 1 hour if unit not found
  
  let isoDuration = 'P'
  if (['seconds', 'minutes', 'hours'].includes(unit)) {
    isoDuration += 'T'
  }
  isoDuration += `${quantity}${unitInfo.iso}`
  
  return isoDuration
}

/**
 * Add a duration to a date
 * @param date Date to add duration to
 * @param isoDuration ISO 8601 duration string
 * @returns New date with duration added
 */
export const addDurationToDate = (date: Date, isoDuration: string): Date => {
  const { quantity, unit } = parseDuration(isoDuration)
  const result = new Date(date)
  
  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + Math.floor(quantity))
      if (quantity % 1 > 0) { // Handle fractional days
        result.setHours(result.getHours() + Math.floor((quantity % 1) * 24))
      }
      break
    case 'hours':
      result.setHours(result.getHours() + Math.floor(quantity))
      if (quantity % 1 > 0) { // Handle fractional hours
        result.setMinutes(result.getMinutes() + Math.floor((quantity % 1) * 60))
      }
      break
    case 'minutes':
      result.setMinutes(result.getMinutes() + Math.floor(quantity))
      if (quantity % 1 > 0) { // Handle fractional minutes
        result.setSeconds(result.getSeconds() + Math.floor((quantity % 1) * 60))
      }
      break
    case 'seconds':
      result.setSeconds(result.getSeconds() + quantity)
      break
  }
  
  return result
}
