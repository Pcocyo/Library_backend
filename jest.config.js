//export default {
//    preset: "ts-jest/presets/default-esm", // if using ESM modulesc
//    moduleNameMapper: {
//        // Only map relative imports (starting with ./ or ../)
//        '^(\.\.[/\\].*)\.js$': '$1.ts',
//        '^(\.\/.*)\.js$': '$1.ts',
//    },
//    extensionsToTreatAsEsm: [".ts"],
//    testEnvironment: "node",
//    transform: {
//        "^.+\\.ts$": [
//            "ts-jest",
//            { tsconfig: "tsconfig.test.json", useEsm: true },
//        ],
//    },
//    moduleFileExtensions: ["ts", "js", "json", "node"],
//    testMatch: ["**/*.test.ts"],
//};

export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { 
        tsconfig: "tsconfig.test.json",
        useESM: true,
      },
    ],
  },
  // NO moduleNameMapper - let ts-jest handle it
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
