import { AutocompleteArrayInput, BooleanField, BooleanInput, Create, Datagrid, Edit, FunctionField, List, ReferenceArrayInput, SaveButton, SelectInput, SimpleForm, TextInput, Toolbar, useGetList, useRecordContext } from 'react-admin'
import { RRoom, RUser } from '../raTypes-d'
import { Box, Stack, useTheme } from '@mui/material'
import React, { useMemo, useState } from 'react'
import {  RoomDetails } from '../../../types/rooms-d'
import { roomTypeFactory } from '../../../services/roomTypes'

const renderRoomType = (record: RRoom): React.ReactNode => {
  const strategy = roomTypeFactory.get(record.details?.specifics?.roomType || 'chat')
  if(!strategy) return <span>Unknown</span>
  return <span>{strategy.label}</span>
}

const renderRoomSpecifics = (record: RRoom): React.ReactNode => {
  const strategy = roomTypeFactory.get(record.details?.specifics?.roomType || 'chat')
  if(!strategy) return <></>
  return <strategy.showComponent />
}

const roundBox: React.CSSProperties = { marginTop: '15px', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }

// Component that uses theme colors for proper dark mode support
const LegendLabel = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme()
  
  // Use theme background color and text color
  const style: React.CSSProperties = { 
    position: 'relative', 
    top: '-0.8rem', 
    left: '0.5rem', 
    backgroundColor: theme.palette.background.paper, 
    padding: '0 0.5rem', 
    display: 'inline-block', 
    zIndex: 1, 
    color: theme.palette.text.secondary
  }
  
  return <span style={style}>{children}</span>
}

interface BoldNameFieldProps {
  source: string
  selectedId: string | null
}

const BoldNameField = ({ source, selectedId }: BoldNameFieldProps) => {
  const record = useRecordContext() as RRoom
  if (!record) return null
  
  return (
    <span style={{ fontWeight: record.id === selectedId ? 'bold' : 'normal' }}>
      {record[source]}
    </span>
  )
}

const NotOwnerDropdown = ({ source, reference }: { source: string; reference: string }) => {
  const users: RUser[] = useGetList<RUser>('users')?.data || []
  const nonAdminUsers = users.filter(user => user.id !== 'admin')
  return (
    <ReferenceArrayInput source={source} reference={reference}>
      <AutocompleteArrayInput helperText="Admin user already has access to all channels" source={source} optionText="name" optionValue="id" choices={nonAdminUsers}/>
    </ReferenceArrayInput>
  )
}

const RoomSpecifics = () => {
  const record = useRecordContext() as RRoom
  const [roomType, setRoomType] = useState<string>(record.details?.specifics?.roomType || 'chat')
  const strategy = useMemo(() => roomTypeFactory.get(roomType), [roomType])
  const roomTypes = roomTypeFactory.list()
  const roomTypeNames = roomTypes.map((roomType) => ({ name: roomType.label + ' - ' + roomType.description, id: roomType.id }))
  
  // We need to handle the component rendering in a type-safe way
  // This is a bit complex due to the generic nature of the components
  const renderStrategyComponent = useMemo(() => {
    if (!strategy) return null
    const EditComponent = strategy.editComponent
    return <EditComponent/>
  }, [strategy])

  const updateRoomType = (newType: string) => {
    // get a new default config for the room type
    const defaultConfig = strategy?.defaultConfig as RoomDetails['specifics']
    record.details = { specifics: defaultConfig, ...record.details } as RoomDetails
    setRoomType(newType)
  }
  
  return (
    <>
      <TextInput source="details.description" label="Description" />
      <Box style={roundBox}>
        <LegendLabel>Custom room properties</LegendLabel>
        <SelectInput source="details.specifics.roomType" label="Room Type" choices={roomTypeNames} onChange={(e) => updateRoomType(e.target.value as string)} />
        {renderStrategyComponent}
      </Box>
    </>
  )
}

export const EditRoom = ({ id }: { id?: string }) => {
  return (
    <Edit title='> Edit room' key={id} id={id} mutationMode='pessimistic' undoable={false}>
      <SimpleForm>
        <TextInput source="name" />
        <RoomSpecifics/>
        <Box style={roundBox}>
          <LegendLabel>Access Control</LegendLabel>
          <NotOwnerDropdown source="members" reference="users" />
          <Stack direction='row' spacing={2}>
            <ReferenceArrayInput source="memberForces" reference="groups">
              <AutocompleteArrayInput optionText="id" />          
            </ReferenceArrayInput>  
            <BooleanInput helperText="Public rooms are visible to all users" source="public" />    
          </Stack>
        </Box>
      </SimpleForm>
    </Edit>
  )
}

export const CreateRoom = ({ embedded = false }: { embedded?: boolean }) => (
  <Create
    title='> Create new room'
    record={{
      details: {
        specifics: {
          roomType: 'chat'
        }
      }
    }}
    mutationOptions={{
      onSuccess: () => {
        // When embedded is true, don't navigate away
        return embedded ? false : undefined
      }
    }}
  >
    <SimpleForm toolbar={<Toolbar><SaveButton label='Create' alwaysEnable /></Toolbar>}>
      <Stack direction='row' spacing={2}>
        <TextInput source="id" required />
        <TextInput source="name" required />
      </Stack>
      <RoomSpecifics/>
      <Box style={roundBox}>
          <LegendLabel>Access Control</LegendLabel>
          <NotOwnerDropdown source="members" reference="users" />
          <Stack direction='row' spacing={2}>
            <ReferenceArrayInput source="memberForces" reference="groups">
              <AutocompleteArrayInput optionText="id" />          
            </ReferenceArrayInput>  
            <BooleanInput helperText="Public rooms are visible to all users" source="public" />    
          </Stack>
        </Box>
    </SimpleForm>
  </Create>
)

export const ListRoom = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  // Define the aside component that will show either the edit or create form
  const Aside = () => (
    <div style={{ width: '80%', marginLeft: '1rem' }}>
      {selectedRoomId ? (
        <EditRoom id={selectedRoomId} />
      ) : (
        <CreateRoom embedded={true} />
      )}
    </div>
  )

  return (
    <List aside={<Aside />}>
      <Datagrid
        rowSx={(record) => record.id === selectedRoomId ? { backgroundColor: '#f5f5f5' } : {}}
        rowClick={(id) => {
          setSelectedRoomId(id === selectedRoomId ? null : id as string)
          return false // Prevent default navigation
        }}
      >
        <BoldNameField source="name" selectedId={selectedRoomId} />
        <FunctionField render={renderRoomType} label="Room Type" />
        <FunctionField render={renderRoomSpecifics} label="Room Specifics" />
        <BooleanField source="public" />
      </Datagrid>
    </List>
  )
}
