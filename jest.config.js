// to use es6module inside ts jest file
export default {
  preset: "ts-jest/presets/default-esm",         // use ts-jest for TypeScript files
  testEnvironment: "node",   // Node environment
  moduleFileExtensions: ["ts", "js", "json", "node"], // file types Jest should process
  testMatch: ["**/*.test.ts"], // match test files
   transform: {
    '^.+\\.tsx?$': ['ts-jest'],
  },
};
