import { Datagrid, DateField, DateTimeInput, List, RadioButtonGroupInput, TextField } from 'react-admin'
import { Edit, SimpleForm, TextInput, useNotify } from 'react-admin'
import { useFormContext } from 'react-hook-form'
import { Card, CardHeader, CardContent, Stack, Button } from '@mui/material'
import { RGameState } from '../raTypes-d'
import { useMemo, useState, useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { ThemeEditor } from './theme-editor'
import { ThemeConfig } from 'antd'

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
  
  // Theme state management
  const [playerThemeDialogOpen, setPlayerThemeDialogOpen] = useState(false)
  const [adminThemeDialogOpen, setAdminThemeDialogOpen] = useState(false)
  const [playerTheme, setPlayerTheme] = useState<ThemeConfig>({})
  const [adminTheme, setAdminTheme] = useState<ThemeConfig>({})
  const notify = useNotify()
  
  const handleOpenPlayerThemeEditor = () => {
    const formField = document.querySelector('input[name="playerTheme"]') as HTMLInputElement
    if (formField) {
      const themeText = formField.value || '{}'
      setPlayerTheme(JSON.parse(themeText))
    }
    setPlayerThemeDialogOpen(true)
  }
  
  const handleClosePlayerThemeEditor = () => {
    setPlayerThemeDialogOpen(false)
  }
  
  const handleOpenAdminThemeEditor = () => {
    const formField = document.querySelector('input[name="adminTheme"]') as HTMLInputElement
    if (formField) {
      const themeText = formField.value || '{}'
      setAdminTheme(JSON.parse(themeText))
    }
    setAdminThemeDialogOpen(true)
  }
  
  const handleCloseAdminThemeEditor = () => {
    setAdminThemeDialogOpen(false)
  }

  const handleSavePlayerTheme = (newTheme: ThemeConfig) => {
    // We'll use the FormDataConsumer to update the playerTheme field
    // The actual update happens in the component render
    setPlayerTheme(newTheme)
    notify('Player theme updated successfully', { type: 'success' })
  }
  
  const handleSaveAdminTheme = (newTheme: ThemeConfig) => {
    // We'll use the FormDataConsumer to update the adminTheme field
    // The actual update happens in the component render
    setAdminTheme(newTheme)
    notify('Admin theme updated successfully', { type: 'success' })
  }
  
  // Component to handle theme updates
  const ThemeUpdater = ({ 
    playerTheme, 
    adminTheme 
  }: { 
    playerTheme: ThemeConfig, 
    adminTheme: ThemeConfig 
  }) => {
    const { setValue } = useFormContext()
    
    // Update the form values when themes change
    useEffect(() => {
      if (playerTheme) {
        setValue('playerTheme', playerTheme, { shouldDirty: true })
      }
    }, [playerTheme, setValue])
    
    useEffect(() => {
      if (adminTheme) {
        setValue('adminTheme', adminTheme, { shouldDirty: true })
      }
    }, [adminTheme, setValue])
    
    return null
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
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenPlayerThemeEditor}
                  >
                    Edit Player Theme
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleOpenAdminThemeEditor}
                  >
                    Edit Admin Theme
                  </Button>
                </Stack>
                
                {/* Hidden fields for theme data */}
                <ThemeUpdater playerTheme={playerTheme} adminTheme={adminTheme} />
                <TextInput 
                  source="playerTheme" 
                  style={{ display: 'none' }} 
                  format={(value) => JSON.stringify(value)} 
                  parse={(value) => value ? JSON.parse(value) : undefined} 
                />
                <TextInput 
                  source="adminTheme" 
                  style={{ display: 'none' }} 
                  format={(value) => JSON.stringify(value)} 
                  parse={(value) => value ? JSON.parse(value) : undefined} 
                />
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
          
          {/* Theme Editor Dialogs */}
          <ThemeEditor
            open={playerThemeDialogOpen}
            onClose={handleClosePlayerThemeEditor}
            initialTheme={playerTheme}
            onSave={handleSavePlayerTheme}
            title="Edit Player Theme"
          />
          <ThemeEditor
            open={adminThemeDialogOpen}
            onClose={handleCloseAdminThemeEditor}
            initialTheme={adminTheme}
            onSave={handleSaveAdminTheme}
            title="Edit Admin Theme"
          />
        </SimpleForm>
    </Edit>
  )
}