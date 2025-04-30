import { Datagrid, List, Show, SimpleShowLayout, TextField, useRecordContext } from 'react-admin'
import { useState } from 'react'

interface BoldNameFieldProps {
  source: string
  selectedId: string | null
}

const BoldNameField = ({ source, selectedId }: BoldNameFieldProps) => {
  const record = useRecordContext()
  if (!record) return null
  
  return (
    <span style={{ fontWeight: record.id === selectedId ? 'bold' : 'normal' }}>
      {record[source]}
    </span>
  )
}

export const ShowTemplates = ({ id }: { id?: string }) => (
  <Show title='> Template details' id={id}>
    <SimpleShowLayout>
      <TextField source='id' />
      <TextField source='name' />
      <TextField source='schema.type' />
      <TextField source='uiSchema.message.ui:widget' />
    </SimpleShowLayout>
  </Show>
)

export const ListTemplates: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: '1' }}>
        <List>
          <Datagrid
            rowSx={(record) => record.id === selectedTemplateId ? { backgroundColor: '#f5f5f5' } : {}}
            rowClick={(id) => {
              setSelectedTemplateId(id === selectedTemplateId ? null : id as string)
              return false // Prevent default navigation
            }}
          >
            <BoldNameField source='name' selectedId={selectedTemplateId} />
            <TextField source='id' />
          </Datagrid>
        </List>
      </div>
      <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedTemplateId && (
          <ShowTemplates id={selectedTemplateId} />
        )}
      </div>
    </div>
  )
}