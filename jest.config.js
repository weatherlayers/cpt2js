module.exports = {
    testEnvironment: 'jsdom',
    reporters: [
      'default',
      'jest-simple-summary'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/**/*.test.js',
    ],
  };
  