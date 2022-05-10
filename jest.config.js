module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  reporters: [
    'default',
    'jest-simple-summary'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
  ],
};
