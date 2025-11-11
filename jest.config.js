module.exports = {
   preset: "ts-jest",
   maxWorkers:1,
   testEnvironment: "node",
   transform:{
      "^.+\\.ts$":[
         "ts-jest",
         {
            tsconfig:"tsconfig.test.json"
         }
      ]
   },
   clearMocks: true,
   resetModules: true,
   cache: true,
   cacheDirectory: "tmp/jest_cache",
   moduleFileExtensions: ["ts","js","json","node"],
   testMatch:["**/*.test.ts"]
}
