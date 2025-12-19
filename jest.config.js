module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/cli/**/*.ts',
    'src/cli-session.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ]
};
