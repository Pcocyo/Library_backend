import { App } from "supertest/types";
import { Server } from "../../src/Server/Server";
import User, { UserRole } from "../../src/Controller/User/User";
import Profile from "../../src/Controller/Profile/Profile";
import { ProfileStatus } from "../../src/Controller/Profile/Profile.interface";
import Env from "../../src/Config/config";
import request from "supertest";

describe("Profile Router Test",()=>{

   let initializeDummyUser = ()=>{
      let dummyEmail = "dummyEmail";
      let dummyId = "dummyId";
      let dummyPassword = "dummyPassword";
      let dummyRole = UserRole.GUEST;
      let dummyCreatedAt = new Date;

      return User.tests__createTestUser(dummyId,dummyEmail,dummyPassword,dummyRole,dummyCreatedAt);
   }
   
   let initializeDummyProfile = ()=>{
      let dummyId = "dummyId";
      let dummyUserName = "dummyUserName";
      let dummyFirstName = "dummyFirstName";
      let dummyLastName = "dummyLastName";
      let dummyContact = "dummyContact";
      let dummyAddress = "dummyAddress";
      let dummyMembershipDate = new Date;
      let dummyStatus = ProfileStatus.ACTIVE;
      let dummyTotalFines = 0.0;
      let dummyUpdatedAt = new Date;

      return Profile.Tests__CreateProfile__(
         {
            user_id : dummyId,
            user_name: dummyUserName,
            first_name:dummyFirstName,
            last_name: dummyLastName,
            contact: dummyContact,
            address: dummyAddress,
            membership_date: dummyMembershipDate,
            status: dummyStatus,
            total_fines: dummyTotalFines,
            updated_at: dummyUpdatedAt,
         }
      )
   }

   let serverApp: App;
   let dummyUser:User = initializeDummyUser();
   let dummyToken = Env.getGenerateJwtToken(dummyUser);
   let dummyProfile:Profile = initializeDummyProfile();

   let profileMock:any;
   
   beforeAll(()=>{
      const serverInstance:Server = Server.getInstance(); 
      serverApp = (serverInstance as any).app;
   })
   beforeEach(()=>{
      profileMock = jest.spyOn(Profile,"GetByUserId")
      profileMock.mockResolvedValue(dummyProfile);
   })

   it("get /profile/getProfile route should return error when request is unauthorized",async ()=>{
      const response = await request(serverApp).get("/profile/getProfile");
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized Request");
   })

   it("get /profile/getProfile route should return profile information",async ()=>{
      const response = await request(serverApp).get("/profile/getProfile").set("Authorization",dummyToken)
      expect(response.body).toHaveProperty("user_id");
      expect(response.body).toHaveProperty("user_name");
      expect(response.body).toHaveProperty("first_name");
      expect(response.body).toHaveProperty("last_name");
      expect(response.body).toHaveProperty("contact");
      expect(response.body).toHaveProperty("address");
      expect(response.body).toHaveProperty("membership_date");
      expect(response.body).toHaveProperty("total_fines");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("updated_at");
   })

})
