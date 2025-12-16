import { App } from "supertest/types";
import { Server } from "../../src/Server/Server";
import request from "supertest";
import { response } from "express";

describe("Profile Router Test",()=>{
   let serverApp: App

   beforeAll(()=>{
      const serverInstance:Server = Server.getInstance(); 
      serverApp = (serverInstance as any).app;
   })

   it("Should work", async ()=>{
      const response = await request(serverApp).get("/profile/");
      console.log(response.body);
   })
})
