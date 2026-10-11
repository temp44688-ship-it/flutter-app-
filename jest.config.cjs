module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: [
    'src/database/**/*.{ts,tsx}',
    'src/features/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: { statements: 80, lines: 80, branches: 70, functions: 80 },
  },
};
