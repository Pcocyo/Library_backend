// to use es6module inside ts jest file
export default {
    preset: "ts-jest/presets/default-esm", // if using ESM modules
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    testMatch: ["**/*.test.ts"],
};

// preset: "ts-jest/presets/default-esm", // use ts-jest for TypeScript files
// testEnvironment: "node", // Node environment
// moduleFileExtensions: ["ts", "js", "json", "node"], // file types Jest should process
// globals:{
//       "ts-jest":{
//           tsconfig:'tsconfig.test.json'
//       }
//   },
// testMatch: ["**/*.test.ts"], // match test files
// modulePathIgnorePatterns: ["<rootDir>/dist/"],
