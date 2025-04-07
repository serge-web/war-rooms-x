# Phase 5: Backup, Restore, and Export Test

'As a Data Management Specialist, specializing in data persistence and export functionality, it is your goal to write tests that verify backup, restore, and export capabilities. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. Backup/Restore UI works correctly with local JSON
2. Message logs can be exported in JSON format by room/turn
3. Version metadata is properly stored
4. "View System Log" modal is accessible for White force users

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { XMPPProvider } from '../context/XMPPContext'
import { UserProvider } from '../context/UserContext'
import BackupRestorePanel from '../components/admin/BackupRestorePanel'
import ExportPanel from '../components/admin/ExportPanel'
import SystemLogModal from '../components/admin/SystemLogModal'

// Mock file system API
const mockDownloadBlob = jest.fn()
const mockReadFile = jest.fn()

// Mock global functions
global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

// Mock FileReader
Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    readAsText: mockReadFile,
    onload: null
  }))
})

// Mock XMPP service
jest.mock('../services/xmpp', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getNodeItems: jest.fn().mockImplementation((nodeId) => {
    if (nodeId === 'game_metadata') {
      return Promise.resolve([
        {
          id: 'metadata',
          content: {
            name: 'Test Wargame',
            description: 'Test wargame description',
            startDate: '2025-04-01',
            endDate: '2025-04-10',
            currentTurn: 2,
            currentPhase: 'Execution',
            version: '1.0.0'
          }
        }
      ])
    } else if (nodeId === '__system_log') {
      return Promise.resolve([
        {
          id: 'log1',
          content: {
            type: 'game_created',
            timestamp: '2025-04-01T10:00:00Z',
            user: 'admin'
          }
        },
        {
          id: 'log2',
          content: {
            type: 'turn_advanced',
            timestamp: '2025-04-02T09:30:00Z',
            user: 'admin',
            turn: 1,
            phase: 'Planning'
          }
        },
        {
          id: 'log3',
          content: {
            type: 'turn_advanced',
            timestamp: '2025-04-03T14:15:00Z',
            user: 'admin',
            turn: 2,
            phase: 'Execution'
          }
        }
      ])
    }
    return Promise.resolve([])
  }),
  getAllNodes: jest.fn().mockResolvedValue([
    'game_metadata',
    'templates',
    'room1',
    'room2',
    '__system_log'
  ]),
  getMessages: jest.fn().mockImplementation((roomId) => {
    if (roomId === 'room1') {
      return Promise.resolve([
        { 
          id: 'msg1', 
          from: 'user1', 
          body: 'Message in turn 1', 
          timestamp: '2025-04-02T10:30:00Z',
          metadata: { turn: 1 }
        },
        { 
          id: 'msg2', 
          from: 'user2', 
          body: 'Another message in turn 1', 
          timestamp: '2025-04-02T11:15:00Z',
          metadata: { turn: 1 }
        },
        { 
          id: 'msg3', 
          from: 'user1', 
          body: 'Message in turn 2', 
          timestamp: '2025-04-03T15:20:00Z',
          metadata: { turn: 2 }
        }
      ])
    }
    return Promise.resolve([])
  }),
  getRooms: jest.fn().mockResolvedValue([
    { id: 'room1', name: 'Planning Room', type: 'muc' },
    { id: 'room2', name: 'Intel Room', type: 'muc' }
  ]),
  createNode: jest.fn().mockResolvedValue(true),
  publishToNode: jest.fn().mockResolvedValue(true),
  deleteNode: jest.fn().mockResolvedValue(true)
}))

describe('Backup, Restore, and Export', () => {
  // Test backup functionality
  test('creates backup of all game data', async () => {
    // Mock download function
    const mockCreateBackup = jest.fn().mockImplementation(() => {
      const backupData = {
        metadata: {
          name: 'Test Wargame',
          version: '1.0.0',
          timestamp: expect.any(String)
        },
        nodes: {
          game_metadata: [{ /* metadata content */ }],
          templates: [{ /* templates content */ }],
          room1: [{ /* room1 messages */ }],
          room2: [{ /* room2 messages */ }]
        }
      }
      
      return backupData
    })
    
    // Mock the backup service
    jest.mock('../services/backup', () => ({
      createBackup: mockCreateBackup,
      restoreBackup: jest.fn()
    }))
    
    render(
      <XMPPProvider>
        <BackupRestorePanel />
      </XMPPProvider>
    )
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/backup and restore/i)).toBeInTheDocument()
    })
    
    // Click backup button
    fireEvent.click(screen.getByRole('button', { name: /create backup/i }))
    
    // Verify backup was created
    await waitFor(() => {
      expect(mockCreateBackup).toHaveBeenCalled()
      expect(screen.getByText(/backup created successfully/i)).toBeInTheDocument()
    })
    
    // Verify download link is available
    expect(screen.getByRole('link', { name: /download backup/i })).toBeInTheDocument()
  })
  
  // Test restore functionality
  test('restores game data from backup file', async () => {
    // Mock restore function
    const mockRestoreBackup = jest.fn().mockResolvedValue(true)
    
    // Mock the backup service
    jest.mock('../services/backup', () => ({
      createBackup: jest.fn(),
      restoreBackup: mockRestoreBackup
    }))
    
    render(
      <XMPPProvider>
        <BackupRestorePanel />
      </XMPPProvider>
    )
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/backup and restore/i)).toBeInTheDocument()
    })
    
    // Create a mock file
    const file = new File(
      ['{"metadata":{"name":"Restored Game","version":"1.0.0"},"nodes":{}}'], 
      'backup.json', 
      { type: 'application/json' }
    )
    
    // Upload file
    const fileInput = screen.getByLabelText(/select backup file/i)
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Simulate FileReader onload
    act(() => {
      const fileReader = FileReader.mock.instances[0]
      fileReader.onload({ target: { result: '{"metadata":{"name":"Restored Game","version":"1.0.0"},"nodes":{}}' } })
    })
    
    // Click restore button
    fireEvent.click(screen.getByRole('button', { name: /restore from backup/i }))
    
    // Confirm in modal
    fireEvent.click(screen.getByRole('button', { name: /confirm restore/i }))
    
    // Verify restore was called
    await waitFor(() => {
      expect(mockRestoreBackup).toHaveBeenCalled()
      expect(screen.getByText(/restore completed successfully/i)).toBeInTheDocument()
    })
  })
  
  // Test export functionality
  test('exports message logs by room and turn', async () => {
    render(
      <XMPPProvider>
        <ExportPanel />
      </XMPPProvider>
    )
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/export data/i)).toBeInTheDocument()
    })
    
    // Wait for rooms to load in dropdown
    await waitFor(() => {
      expect(screen.getByText('Planning Room')).toBeInTheDocument()
    })
    
    // Select room
    fireEvent.change(screen.getByLabelText(/select room/i), { 
      target: { value: 'room1' } 
    })
    
    // Select turn
    fireEvent.change(screen.getByLabelText(/select turn/i), { 
      target: { value: '1' } 
    })
    
    // Click export button
    fireEvent.click(screen.getByRole('button', { name: /export messages/i }))
    
    // Verify export was created
    await waitFor(() => {
      expect(screen.getByText(/export created successfully/i)).toBeInTheDocument()
    })
    
    // Verify download link is available
    expect(screen.getByRole('link', { name: /download export/i })).toBeInTheDocument()
  })
  
  // Test version metadata
  test('displays version metadata', async () => {
    render(
      <XMPPProvider>
        <BackupRestorePanel />
      </XMPPProvider>
    )
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/backup and restore/i)).toBeInTheDocument()
    })
    
    // Verify version info is displayed
    expect(screen.getByText(/version: 1\.0\.0/i)).toBeInTheDocument()
  })
  
  // Test system log modal for White force
  test('shows system log modal for White force users', async () => {
    // Render with White force user
    render(
      <UserProvider initialUser={{ force: 'white', role: 'umpire' }}>
        <XMPPProvider>
          <SystemLogModal />
        </XMPPProvider>
      </UserProvider>
    )
    
    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /view system log/i }))
    
    // Wait for log entries to load
    await waitFor(() => {
      expect(screen.getByText(/system log/i)).toBeInTheDocument()
    })
    
    // Verify log entries are displayed
    expect(screen.getByText(/game_created/i)).toBeInTheDocument()
    expect(screen.getByText(/turn_advanced/i)).toBeInTheDocument()
    
    // Verify timestamps are displayed
    expect(screen.getByText('2025-04-01T10:00:00Z')).toBeInTheDocument()
    expect(screen.getByText('2025-04-02T09:30:00Z')).toBeInTheDocument()
  })
  
  // Test system log is not accessible for non-White force users
  test('hides system log from non-White force users', async () => {
    // Render with Blue force user
    render(
      <UserProvider initialUser={{ force: 'blue', role: 'commander' }}>
        <XMPPProvider>
          <div>
            <button>Some other button</button>
            <SystemLogModal />
          </div>
        </XMPPProvider>
      </UserProvider>
    )
    
    // Verify system log button is not present
    expect(screen.queryByRole('button', { name: /view system log/i })).not.toBeInTheDocument()
  })
})
```
