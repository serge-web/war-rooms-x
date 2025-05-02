const camelNameToLabel = (name: string) => {
  const reFindHumps = /([A-Z]){1}([a-z0-9]){1}/g
  const re1stLower = /^[a-z]{1}/
  let label = name.replace(reFindHumps, ' $1$2')

  if (re1stLower.test(label)) {
    label =  label.substr(0,1).toUpperCase() + label.substring(1)
  }
  return label
}

/**
 * Renders a JSON object into a React component
 * @param obj The object to render
 * @param level The current level of indentation
 * @returns A React component representing the object
 */
export const renderObjectContent = (obj: unknown, level: number = 0): React.ReactNode => {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return <span className='message-value message-null'>{obj === null ? 'null' : 'undefined'}</span>
  }
  
  // Handle primitive values
  if (typeof obj === 'string') {
    return <span style={{ display: 'contents' }} className='message-value message-string'>{obj}</span>
  } 
  
  if (typeof obj === 'number') {
    return <span className='message-value message-number'>{obj.toString()}</span>
  }
  
  if (typeof obj === 'boolean') {
    return <span className='message-value message-boolean'>{obj.toString()}</span>
  }
  
  if (typeof obj !== 'object') {
    // Handle other primitive types
    return <span className='message-value'>{String(obj)}</span>
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return <span className='message-value message-array'>[]</span>
    }
    
    return (
      <div className='message-array' style={{ marginLeft: `${level * 12}px` }}>
        {obj.map((item, index) => (
          <div key={index} className='message-array-item'>
            <span className='message-label'>[{index}]:</span> {renderObjectContent(item, level + 1)}
          </div>
        ))}
      </div>
    )
  }
  
  // Handle objects
  // At this point we know obj is a non-null object that's not an array
  const entries = Object.entries(obj as Record<string, unknown>)
  
  if (entries.length === 0) {
    return <span className='message-value message-object'>{'{}'}</span>
  }
  
  return (
    <div className='message-object' style={{ marginLeft: `${level * 12}px`}}>
      {entries.map(([key, value]) => (
        <div key={key} className='message-object-item' style={{ float: 'left'}}>
          <span style={{ display: 'contents' }} className='message-label'>{camelNameToLabel(key)}:</span> {renderObjectContent(value, level + 1)}
        </div>
      ))}
    </div>
  )
}