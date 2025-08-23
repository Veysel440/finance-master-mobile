/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo/universal',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^app/(.*)$': '<rootDir>/app/$1'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@unimodules/.*|unimodules|react-clone-referenced-element|nativewind|react-native-svg|expo-router)'
    ]
};