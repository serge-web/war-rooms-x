import { parseDuration, formatDuration, addDurationToDate, timeUnits } from '../../helpers/durationHelper'

describe('durationHelper', () => {
  describe('parseDuration', () => {
    it('should parse ISO 8601 duration strings correctly', () => {
      // Test days
      expect(parseDuration('P1D')).toEqual({ quantity: 1, unit: 'days' })
      expect(parseDuration('P7D')).toEqual({ quantity: 7, unit: 'days' })
      
      // Test hours
      expect(parseDuration('PT1H')).toEqual({ quantity: 1, unit: 'hours' })
      expect(parseDuration('PT24H')).toEqual({ quantity: 24, unit: 'hours' })
      
      // Test minutes
      expect(parseDuration('PT30M')).toEqual({ quantity: 30, unit: 'minutes' })
      expect(parseDuration('PT90M')).toEqual({ quantity: 90, unit: 'minutes' })
      
      // Test seconds
      expect(parseDuration('PT15S')).toEqual({ quantity: 15, unit: 'seconds' })
      expect(parseDuration('PT3600S')).toEqual({ quantity: 3600, unit: 'seconds' })
    })
    
    it('should handle complex duration strings', () => {
      // Complex durations should return the most significant unit
      expect(parseDuration('P1DT6H')).toEqual({ quantity: 1.25, unit: 'days' })
      expect(parseDuration('PT1H30M')).toEqual({ quantity: 1.5, unit: 'hours' })
    })
    
    it('should handle legacy format (plain numbers)', () => {
      // Legacy format assumed to be minutes
      expect(parseDuration('30')).toEqual({ quantity: 30, unit: 'minutes' })
      expect(parseDuration('60')).toEqual({ quantity: 60, unit: 'minutes' })
    })
    
    it('should handle invalid inputs', () => {
      // Invalid inputs should return default values
      expect(parseDuration('')).toEqual({ quantity: 1, unit: 'hours' })
      expect(parseDuration('invalid')).toEqual({ quantity: 1, unit: 'hours' })
    })
  })
  
  describe('formatDuration', () => {
    it('should format quantity and unit into ISO 8601 duration strings', () => {
      // Test days
      expect(formatDuration(1, 'days')).toBe('P1D')
      expect(formatDuration(7, 'days')).toBe('P7D')
      
      // Test hours
      expect(formatDuration(1, 'hours')).toBe('PT1H')
      expect(formatDuration(24, 'hours')).toBe('PT24H')
      
      // Test minutes
      expect(formatDuration(30, 'minutes')).toBe('PT30M')
      expect(formatDuration(90, 'minutes')).toBe('PT90M')
      
      // Test seconds
      expect(formatDuration(15, 'seconds')).toBe('PT15S')
      expect(formatDuration(3600, 'seconds')).toBe('PT3600S')
    })
    
    it('should handle decimal values', () => {
      // Decimal values should be preserved
      expect(formatDuration(1.5, 'days')).toBe('P1.5D')
      expect(formatDuration(0.5, 'hours')).toBe('PT0.5H')
    })
    
    it('should handle invalid units', () => {
      // Invalid units should return default value
      expect(formatDuration(10, 'invalid-unit')).toBe('PT1H')
    })
  })
  
  describe('addDurationToDate', () => {
    it('should correctly add durations to dates', () => {
      const baseDate = new Date('2025-01-01T12:00:00Z')
      
      // Add 1 day
      const oneDayLater = addDurationToDate(baseDate, 'P1D')
      expect(oneDayLater.toISOString()).toBe('2025-01-02T12:00:00.000Z')
      
      // Add 2 hours
      const twoHoursLater = addDurationToDate(baseDate, 'PT2H')
      expect(twoHoursLater.toISOString()).toBe('2025-01-01T14:00:00.000Z')
      
      // Add 30 minutes
      const thirtyMinutesLater = addDurationToDate(baseDate, 'PT30M')
      expect(thirtyMinutesLater.toISOString()).toBe('2025-01-01T12:30:00.000Z')
    })
    
    it('should handle complex durations', () => {
      const baseDate = new Date('2025-01-01T12:00:00Z')
      
      // Add 1 day and 6 hours
      const result = addDurationToDate(baseDate, 'P1DT6H')
      expect(result.toISOString()).toBe('2025-01-02T18:00:00.000Z')
    })
  })
  
  describe('timeUnits', () => {
    it('should have the correct structure', () => {
      expect(timeUnits).toHaveLength(4)
      
      // Check each unit has the required properties
      timeUnits.forEach(unit => {
        expect(unit).toHaveProperty('value')
        expect(unit).toHaveProperty('label')
        expect(unit).toHaveProperty('iso')
      })
      
      // Check specific values
      expect(timeUnits[0].value).toBe('seconds')
      expect(timeUnits[1].value).toBe('minutes')
      expect(timeUnits[2].value).toBe('hours')
      expect(timeUnits[3].value).toBe('days')
    })
  })
})
