module.exports = {
   preset: "ts-jest",
   testEnvironment: "node",
   transform:{
      "^.+\\.ts$":[
         "ts-jest",
         {
            tsconfig:"tsconfig.test.json"
         }
      ]
   },
   moduleFileExtensions: ["ts","js","json","node"],
   testMatch:["**/*.test.ts"]
}
