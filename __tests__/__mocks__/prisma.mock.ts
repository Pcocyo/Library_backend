import { jest } from "@jest/globals"

export const createMockPrisma = ()=>({
   users:{
      create:jest.fn(),
      findUnique:jest.fn(),
      delete:jest.fn(),
      update:jest.fn()
   }
})
