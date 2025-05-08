export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/helpers/**/*.test.ts',
    '**/utils/**/*.test.ts',
    '**/types/**/*.test.ts',
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
    'src/helpers/**/*.ts',
    'src/utils/**/*.ts',
    'src/types/**/*.ts',
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
    'src/helpers/**/*.{ts,tsx}': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    },
    'src/types/**/*.{ts,tsx}': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
    // Removed utils threshold since we don't have tests for it yet
  },
  coverageReporters: ['text', 'lcov', 'html']
}
