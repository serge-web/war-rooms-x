import { Datagrid, DateField, DateTimeInput, List, RadioButtonGroupInput, TextField, useRecordContext } from 'react-admin'
import { Edit, SimpleForm, TextInput, useNotify } from 'react-admin'
import { Card, CardHeader, CardContent, Stack, Button } from '@mui/material'
import { RGameState } from '../raTypes-d'
import { useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { ThemeEditor } from './theme-editor'
import { ThemeConfig } from '../../../types/wargame-d'

export const WargameList = () => (
    <List>
        <Datagrid>
        <TextField<RGameState> source="name" />
            <DateField<RGameState> showTime={true} source="startTime" />
            <TextField<RGameState> source="stepTime" />
            <TextField<RGameState> source="turnType" />
            <TextField<RGameState> source="turn" />
            <DateField<RGameState> showTime={true} source="currentTime" />
            <TextField<RGameState> source="currentPhase" />
        </Datagrid>
    </List>
);

const CurrentPhaseInput = () => {
  const { turnType } = useWatch<RGameState>()
  const items = useMemo(() => {
    switch (turnType) {
      case "Linear":
        return [
          { id: 'n/a', name: 'n/a' }
        ]
      case "Plan/Adjudicate":
        return [
          { id: 'Planning', name: 'Planning' },
          { id: 'Adjudication', name: 'Adjudication' }
        ]
    }
  }, [turnType])
  return (
    <RadioButtonGroupInput
      source="currentPhase"
      label="Phase"
      helperText="The current phase of the game"
      required
      choices={items}
    />
  )
}

export const WargameEdit = () => {
  // sort out the turn phase choices
  const turnModels = ['Linear', 'Plan/Adjudicate']
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)
  const record = useRecordContext<RGameState>()
  const notify = useNotify()
  
  const handleOpenThemeEditor = () => {
    setThemeDialogOpen(true)
  }
  
  const handleCloseThemeEditor = () => {
    setThemeDialogOpen(false)
  }
  
  const handleSaveTheme = (newTheme: ThemeConfig) => {
    // Update the form value for the theme field
    // This will be saved when the form is submitted
    const formField = document.querySelector('input[name="theme"]') as HTMLInputElement
    if (formField) {
      formField.value = JSON.stringify(newTheme)
      // Dispatch an input event to trigger form validation
      formField.dispatchEvent(new Event('input', { bubbles: true }))
      notify('Theme updated successfully', { type: 'success' })
    } else {
      notify('Could not update theme field', { type: 'warning' })
    }
  }
  
  return (
    <Edit mutationMode='pessimistic'>
        <SimpleForm>
          <Stack direction="row">
            <Card>
              <CardHeader title="Configuration" />
              <CardContent>Background information, used for game setup</CardContent>
              <CardContent>
                <TextInput required helperText="The name of the wargame" source="name" />
                <TextInput helperText="A description of the wargame" source="description" />
                <Stack direction="row">
                  <DateTimeInput required helperText="The start date and time" source="startTime" />
                  <TextInput required helperText="The step interval" source="stepTime" />
                  <RadioButtonGroupInput required helperText="The turn model 2" source="turnType" choices={turnModels} />
                </Stack>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleOpenThemeEditor}
                  sx={{ mt: 2 }}
                >
                  Edit Theme
                </Button>
                {/* Hidden field for theme data */}
                <TextInput source="theme" style={{ display: 'block' }} format={(value) => JSON.stringify(value)} parse={(value) => value ? JSON.parse(value) : undefined} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Current State" />
              <CardContent>Current state of the game</CardContent>
              <CardContent>
                <DateTimeInput required helperText="The current date and time" source="currentTime" />
                <Stack direction="row" spacing={2}>
                  <TextInput required helperText="The current turn" source="turn" />
                  <CurrentPhaseInput />
                </Stack>
              </CardContent>
            </Card>    
          </Stack>
          
          {/* Theme Editor Dialog */}
          <ThemeEditor
            open={themeDialogOpen}
            onClose={handleCloseThemeEditor}
            initialTheme={record?.theme}
            onSave={handleSaveTheme}
          />
        </SimpleForm>
    </Edit>
  )
}