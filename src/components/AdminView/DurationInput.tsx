// DurationInput.tsx
import { useState, useEffect } from 'react'
import { Stack, TextField, Select, MenuItem, FormHelperText } from '@mui/material'
import { useInput, InputProps } from 'react-admin'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

const timeUnits = [
  { value: 'seconds', label: 'Seconds', iso: 'S' },
  { value: 'minutes', label: 'Minutes', iso: 'M' },
  { value: 'hours', label: 'Hours', iso: 'H' },
  { value: 'days', label: 'Days', iso: 'D' }
]

export const DurationInput = (props: InputProps) => {
  const { field, fieldState } = useInput(props)
  const [quantity, setQuantity] = useState<number>(0)
  const [unit, setUnit] = useState<string>('minutes')
  
  // Parse ISO duration on initial load
  useEffect(() => {
    if (field.value) {
      try {
        // Parse the ISO duration string
        const dur = dayjs.duration(field.value)
        
        // Find the appropriate unit and quantity
        if (field.value.includes('D')) {
          setQuantity(dur.asDays())
          setUnit('days')
        } else if (field.value.includes('H')) {
          setQuantity(dur.asHours())
          setUnit('hours')
        } else if (field.value.includes('M')) {
          setQuantity(dur.asMinutes())
          setUnit('minutes')
        } else {
          setQuantity(dur.asSeconds())
          setUnit('seconds')
        }
      } catch {
        // Handle legacy format
        const value = parseInt(field.value)
        if (!isNaN(value)) {
          setQuantity(value)
          setUnit('minutes') // Default assumption
        }
      }
    }
  }, [field.value])
  
  // Update the ISO duration string when inputs change
  const handleChange = (newQuantity: number, newUnit: string) => {
    const unitInfo = timeUnits.find(u => u.value === newUnit)
    if (!unitInfo) return
    
    let isoDuration = 'P'
    if (['seconds', 'minutes', 'hours'].includes(newUnit)) {
      isoDuration += 'T'
    }
    isoDuration += `${newQuantity}${unitInfo.iso}`
    
    field.onChange(isoDuration)
  }
  
  return (
    <Stack direction="row" spacing={1}>
      <Stack direction="column" spacing={1}>
        <TextField
          type="number"
          value={quantity}
          onChange={(e) => {
            const newValue = parseInt(e.target.value)
            setQuantity(newValue)
            handleChange(newValue, unit)
          }}
          error={!!fieldState.error}
          label={props.label}
          required={props.isRequired}
        />
        {props.helperText && <FormHelperText>{props.helperText}</FormHelperText>}
      </Stack>
      <Select
        value={unit}
        onChange={(e) => {
          const newUnit = e.target.value
          setUnit(newUnit)
          handleChange(quantity, newUnit)
        }}
      >
        {timeUnits.map((unit) => (
          <MenuItem key={unit.value} value={unit.value}>
            {unit.label}
          </MenuItem>
        ))}
      </Select>
      {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
    </Stack>
  )
}