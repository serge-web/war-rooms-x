export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
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
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/vite-env.d.ts',
    '!src/main.tsx',
    '!src/App.tsx',
    '!src/components/**/*.tsx',
    // Exclude integration-heavy modules
    '!src/services/XMPPService.ts',
    '!src/services/XMPPRestService.ts',
    '!src/services/roomTypes/**/*.ts',
    // Exclude integration test files
    '!src/rooms-test/xmpp/**/*.ts'
  ],
  // Reasonable thresholds for unit tests
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    },
    'src/utils/**/*.{ts,tsx}': {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    },
    'src/helpers/**/*.{ts,tsx}': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
}
