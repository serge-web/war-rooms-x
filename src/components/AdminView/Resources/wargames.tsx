import { Datagrid, DateField, DateTimeInput, List, RadioButtonGroupInput, SelectInput, TextField } from 'react-admin';
import { DateInput, Edit, SimpleForm, TextInput } from 'react-admin';
import { Card, CardHeader, CardContent, Stack } from '@mui/material';
import { RGameState } from '../raTypes-d';
import { useMemo } from 'react';
import { useWatch } from "react-hook-form";

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
  const turnModels = ["Linear", "Plan/Adjudicate"]
  
  return (
    <Edit>
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
                  <SelectInput required helperText="The turn model" source="turnType" choices={turnModels} />
                </Stack>
              </CardContent>
            </Card>
          <Card>
            <CardHeader title="Current State" />
            <CardContent>Current state of the game</CardContent>
            <CardContent>
              <DateInput required helperText="The current date and time" source="currentTime" />
              <Stack direction="row" spacing={2}>
                <TextInput required helperText="The current turn" source="turn" />
                <CurrentPhaseInput  />
              </Stack>
            </CardContent>
          </Card>    
          </Stack>

        </SimpleForm>
    </Edit>
  )
}