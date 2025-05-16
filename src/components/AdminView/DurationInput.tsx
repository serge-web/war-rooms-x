// DurationInput.tsx
import { useState, useEffect } from 'react'
import { Stack, TextField, Select, MenuItem, FormHelperText } from '@mui/material'
import { useInput, InputProps } from 'react-admin'
import { timeUnits, parseDuration, formatDuration } from '../../helpers/durationHelper'

export const DurationInput = (props: InputProps) => {
  const { field, fieldState } = useInput(props)
  const [quantity, setQuantity] = useState<number>(0)
  const [unit, setUnit] = useState<string>('minutes')
  
  // Parse ISO duration on initial load
  useEffect(() => {
    if (field.value) {
      const { quantity, unit } = parseDuration(field.value)
      setQuantity(quantity)
      setUnit(unit)
    }
  }, [field.value])
  
  // Update the ISO duration string when inputs change
  const handleChange = (newQuantity: number, newUnit: string) => {
    const isoDuration = formatDuration(newQuantity, newUnit)
    field.onChange(isoDuration)
  }
  
  return (
    <Stack direction="row" spacing={1}>
      <Stack direction="column" spacing={1}>
        <TextField
          type="number"
          value={quantity}
          id={props.id}
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