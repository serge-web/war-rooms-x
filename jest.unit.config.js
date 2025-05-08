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
    'src/hooks/useIndexedDBData.ts',
    'src/hooks/usePubSub.ts',
    'src/hooks/useTemplates.ts',
    // Exclude test files
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}'
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
    'src/hooks/usePubSub.ts': {
      branches: 70,
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
