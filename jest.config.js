module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['json', 'lcov', 'text', 'text-summary', 'json-summary'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(jest-test))']
};
