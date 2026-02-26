/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@components/(.*)$': '<rootDir>/app/components/$1',
    '^@lib/(.*)$': '<rootDir>/app/lib/$1',
    '^@server/(.*)$': '<rootDir>/server/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts']
};
