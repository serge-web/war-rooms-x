export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Only run integration tests
  testMatch: ['**/rooms-test/xmpp/**/*.test.ts'],
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
  // Code coverage configuration for integration tests
  collectCoverage: true,
  coverageDirectory: 'coverage/integration',
  collectCoverageFrom: [
    // Only include integration-heavy modules
    'src/services/XMPPService.ts',
    'src/services/XMPPRestService.ts',
    'src/services/roomTypes/**/*.ts'
  ],
  // Very low thresholds for integration tests since they depend on external services
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
}
