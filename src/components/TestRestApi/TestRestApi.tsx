import { useEffect, useState } from 'react'
import axios from 'axios'

// Define proper types for the API response
interface Group {
  name: string
  description?: string
  members?: string[]
}

interface ApiResponse {
  groups?: Group[]
  [key: string]: unknown
}

// Create a client with the proxy URL
const client = axios.create({
  baseURL: '/openfire-rest',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
})

// Set the authorization header
client.defaults.headers.common['Authorization'] = 'INSERT_KEY_HERE'

const TestRestApi = () => {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [updatedDescription, setUpdatedDescription] = useState('')
  const [updateStatus, setUpdateStatus] = useState<{success: boolean, message: string} | null>(null)

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        setLoading(true)
        
        // Make the request
        const response = await client.get('/groups')
        
        console.log('Response:', response)
        
        // Check if the response contains HTML (which would indicate we're getting the React app instead of API data)
        const isHtml = typeof response.data === 'string' && 
                      (response.data.includes('<!DOCTYPE html>') || 
                       response.data.includes('<html'))
        
        if (isHtml) {
          setError('Received HTML instead of JSON. The proxy is not working correctly.')
          console.error('Received HTML instead of JSON:', response.data)
        } else {
          setData(response.data)
        }
      } catch (err) {
        console.error('API request failed:', err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    
    testApiConnection()
  }, [])
  
  // Function to get a single group
  const getSingleGroup = async (groupName: string) => {
    try {
      setLoading(true)
      setError(null)
      setUpdateStatus(null)
      
      const response = await client.get(`/groups/${groupName}`)
      
      console.log('Single Group Response:', response)
      
      // Check if the response contains HTML
      const isHtml = typeof response.data === 'string' && 
                    (response.data.includes('<!DOCTYPE html>') || 
                     response.data.includes('<html'))
      
      if (isHtml) {
        setError('Received HTML instead of JSON. The proxy is not working correctly.')
        console.error('Received HTML instead of JSON:', response.data)
      } else {
        setSelectedGroup(response.data)
        setUpdatedDescription(response.data.description || '')
      }
    } catch (err) {
      console.error('Get single group failed:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }
  
  // Function to update a group
  const updateGroup = async () => {
    if (!selectedGroup) return
    
    try {
      setLoading(true)
      setError(null)
      setUpdateStatus(null)
      
      const updatedGroup = {
        ...selectedGroup,
        description: updatedDescription
      }
      
      const response = await client.put(`/groups/${selectedGroup.name}`, updatedGroup)
      
      console.log('Update Response:', response)
      
      setUpdateStatus({
        success: true,
        message: `Group ${selectedGroup.name} updated successfully!`
      })
      
      // Refresh the groups list
      const refreshResponse = await client.get('/groups')
      setData(refreshResponse.data)
    } catch (err) {
      console.error('Update group failed:', err)
      setError(err instanceof Error ? err.message : String(err))
      setUpdateStatus({
        success: false,
        message: err instanceof Error ? err.message : String(err)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-api-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>REST API Connection Test</h2>
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="error-container" style={{ padding: '10px', backgroundColor: '#ffeeee', border: '1px solid #ff0000', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {updateStatus && (
        <div className="update-status" style={{ 
          padding: '10px', 
          backgroundColor: updateStatus.success ? '#eeffee' : '#ffeeee', 
          border: `1px solid ${updateStatus.success ? '#00ff00' : '#ff0000'}`,
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>{updateStatus.success ? 'Success' : 'Error'}</h3>
          <p>{updateStatus.message}</p>
        </div>
      )}
      
      {/* Group Selection Section */}
      {data?.groups && data.groups.length > 0 && (
        <div className="group-selection" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Select a Group to Edit</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {data.groups.map((group) => (
              <button 
                key={group.name}
                onClick={() => getSingleGroup(group.name)}
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: selectedGroup?.name === group.name ? '#4a90e2' : '#f0f0f0',
                  color: selectedGroup?.name === group.name ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Edit Group Section */}
      {selectedGroup && (
        <div className="edit-group" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Edit Group: {selectedGroup.name}</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
            <textarea 
              value={updatedDescription} 
              onChange={(e) => setUpdatedDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', minHeight: '100px' }}
            />
          </div>
          <button 
            onClick={updateGroup}
            disabled={loading}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#4a90e2', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Update Group
          </button>
        </div>
      )}
      
      {/* API Response Section */}
      {data && (
        <div className="data-container" style={{ marginTop: '20px' }}>
          <h3>Groups List</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default TestRestApi
