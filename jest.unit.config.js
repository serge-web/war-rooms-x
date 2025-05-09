export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/helpers/**/*.test.ts',
    '**/utils/**/*.test.ts',
    '**/types/**/*.test.ts',
    '**/hooks/**/*.test.ts',
    '**/rooms-test/hooks/**/*.test.ts',
    '**/rooms-test/services/**/*.test.ts',
    '**/project-structure.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Code coverage configuration for unit tests
  collectCoverage: true,
  coverageDirectory: 'coverage/unit',
  // Only include specific directories that are known to work with unit tests
  collectCoverageFrom: [
    'src/components/PlayerView/Rooms/RoomsList/useRooms.ts',
    'src/components/PlayerView/Rooms/useRoom.ts',
    'src/components/PlayerView/GameState/useGameSetup.ts',
    'src/components/PlayerView/GameState/useGameState.ts',
    'src/hooks/useIndexedDBData.ts',
    'src/hooks/usePubSub.ts',
    'src/hooks/useTemplates.ts',
    'src/components/AdminView/helpers/userMapper.ts',
    'src/components/AdminView/helpers/groupMapper.ts',
    'src/components/AdminView/helpers/roomMapper.ts',
    'src/components/AdminView/helpers/templateMapper.ts',
    'src/components/AdminView/helpers/wargameMapper.ts',
    'src/services/XMPPService.ts',
    // Exclude test files
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    // Exclude JSX files that cause issues in test environment
    '!src/services/roomTypes/index.ts',
    '!src/services/roomTypes/ChatRoomStrategy.tsx',
    '!src/services/roomTypes/SimpleFormsStrategy.tsx',
    '!src/services/roomTypes/MapRoomStrategy.tsx'
  ],
  // Reasonable thresholds for unit tests
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    },
    'src/components/PlayerView/Rooms/RoomsList/useRooms.ts': {
      branches: 40,
      functions: 55,
      lines: 65,
      statements: 65
    },
    'src/hooks/useIndexedDBData.ts': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    },
    // Admin View mappers
    'src/components/AdminView/helpers/userMapper.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/components/AdminView/helpers/groupMapper.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/components/AdminView/helpers/roomMapper.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/components/AdminView/helpers/templateMapper.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/components/AdminView/helpers/wargameMapper.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/hooks/usePubSub.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    'src/services/XMPPService.ts': {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    },
    'src/hooks/useTemplates.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
}
