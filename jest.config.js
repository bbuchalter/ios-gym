module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'client/**/*.ts',
    '!src/**/*.d.ts',
    '!client/**/*.d.ts',
    '!src/server/index.ts',
    '!client/**/*.test.ts',
    '!client/__tests__/**'
  ]
};
