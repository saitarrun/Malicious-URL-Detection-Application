module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '../context/AuthContext': '<rootDir>/__mocks__/AuthContext.tsx',
  },
  transform: {
    '^.+\.tsx?$': 'babel-jest',
  },
};
