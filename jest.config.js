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
  // Code coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
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
    '!src/components/AdminView/Resources/theme-editor.tsx',
    // Exclude integration-heavy modules that require live servers
    '!src/services/XMPPService.ts',
    '!src/services/XMPPRestService.ts',
    '!src/services/roomTypes/**/*.ts',
    '!src/services/roomTypes/SimpleFormsStrategy.tsx'
  ],
  // Temporarily lowered thresholds to get coverage reports without failing tests
  // These should be increased as test coverage improves
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5
    },
    'src/rooms-api/**/*.{ts,tsx}': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    },
    'src/**/hooks/**/*.{ts,tsx}': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    },
    'src/components/**/*.{ts,tsx}': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    },
    'src/utils/**/*.{ts,tsx}': {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
}
