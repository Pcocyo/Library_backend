import { App } from "supertest/types";
import { Server } from "../../src/Server/Server";
import User, { UserRole } from "../../src/Controller/User/User";
import Profile from "../../src/Controller/Profile/Profile";
import { ProfileStatus,UserUpdateProfileParam,LibrarianUpdateProfileParam } from "../../src/Controller/Profile/Profile.interface";
import Env from "../../src/Config/config";
import request from "supertest";
import { ClientError, ClientErrorCode } from "../../src/Errors/ClientError";
import { ValidationErrorCode } from "../../src/Errors";
import { response } from "express";
import { exit } from "process";

describe("Profile Route GET and PATCH endpoint test",()=>{
   let initializeDummyUser = ()=>{
      let dummyEmail = "dummyEmail";
      let dummyId = "dummyId";
      let dummyPassword = "dummyPassword";
      let dummyRole = UserRole.GUEST;
      let dummyCreatedAt = new Date;
      return User.tests__createTestUser(dummyId,dummyEmail,dummyPassword,dummyRole,dummyCreatedAt);
   }

   let initializeMemberDummyUser = ()=>{
      let dummyEmail = "dummyEmail";
      let dummyId = "dummyId";
      let dummyPassword = "dummyPassword";
      let dummyRole = UserRole.MEMBER;
      let dummyCreatedAt = new Date;
      return User.tests__createTestUser(dummyId,dummyEmail,dummyPassword,dummyRole,dummyCreatedAt);
   }

   let initializeDummyLibrarian = ()=>{
      let dummyEmail = "dummyEmail";
      let dummyId = "dummyId";
      let dummyPassword = "dummyPassword";
      let dummyRole = UserRole.LIBRARIAN;
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

      let profile =  Profile.Tests__CreateProfile__(
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
      return profile;
   }

   let serverApp: App;
   // User object variable
   let dummyUser:User = initializeDummyUser();
   let dummyLibrarian:User = initializeDummyLibrarian();
   let dummyMemberUser:User = initializeMemberDummyUser();
   //token variable
   let dummyUserToken = Env.getGenerateJwtToken(dummyUser);
   let dummyLibrarianToken = Env.getGenerateJwtToken(dummyLibrarian);
   let dummyMemberUserToken = Env.getGenerateJwtToken(dummyMemberUser);
   //profile variable
   let dummyProfile:Profile = initializeDummyProfile();
   // class mock variable
   let profileMock:any;
   let userMock:any;
   // function mock variable
   let profileSet_Username = jest.fn();
   let profileSet_FirstName = jest.fn();
   let profileSet_LastName = jest.fn();
   let profileSet_Address = jest.fn();
   let profileSet_Contact = jest.fn();
   let profileSet_UpdateAt = jest.fn();
   let profileSet_Status = jest.fn();
   let profileSet_fines = jest.fn();
   let profileSet_memberDate = jest.fn();
   let userSet_role = jest.fn();

   beforeAll(()=>{
      const serverInstance:Server = Server.getInstance(); 
      serverApp = (serverInstance as any).app;
   })

   beforeEach(()=>{
      profileMock = jest.spyOn(Profile,"GetByUserId");
      userMock = jest.spyOn(User,"getUserByEmail");
      // profile mocked funciton
      dummyProfile.set_userName = profileSet_Username;
      dummyProfile.set_firstName = profileSet_FirstName;
      dummyProfile.set_lastName = profileSet_LastName;
      dummyProfile.set_contact= profileSet_Contact;
      dummyProfile.set_address= profileSet_Address;
      dummyProfile.set_updatedAt = profileSet_UpdateAt;
      dummyProfile.set_status = profileSet_Status;
      dummyProfile.set_fines = profileSet_fines;
      dummyProfile.set_memberDate = profileSet_memberDate;
      //user mocked function
      dummyUser.setRole = userSet_role;
      profileMock.mockResolvedValue(dummyProfile);
      userMock.mockResolvedValue(dummyUser);
   })

   afterEach(()=>{
      profileMock.mockRestore();
      userMock.mockRestore();
      jest.resetModules();
   })

   // GET /profile/getProfile logic

   it("GET /profile/get route should return error when request is unauthorized",async ()=>{
      const response = await request(serverApp).get("/profile/get");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
   })

   it("GET /profile/get route should return profile information",async ()=>{
      const response = await request(serverApp).get("/profile/get").set("Authorization",dummyUserToken)
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

   // User PATCH logic
   
   // User PATCH /profile/update logic error

   it("PATCH /profile/update should return with CLIENT_ERROR_002 when user is not authorized", async()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"validLastName",
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp).patch('/profile/update')
         .send({payload:{...updateData}});
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
   })

   it("PATCH /profile/update should validate user_name parameter and respond with VALIDATION_ERROR when username is invalid characther length",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:" ",
         first_name:"validFirstName",
         last_name:"validLastName",
         contact:"600000000000",
         address:"validAddress"
      }

      const response = await request(serverApp)
         .patch("/profile/update")
         .set("Authorization",dummyUserToken)
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate user_name parameter and respond with VALIDATION_ERROR when user_name contain invalid characther",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"invalid username",
         first_name:"validFirstName",
         last_name:"validLastName",
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch("/profile/update")
         .set("Authorization",dummyUserToken)
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate user_name parameter and respond with VALIDATION_ERROR when username is undefined",async ()=>{
      const updateData: UserUpdateProfileParam={
         // no user_name parameter
         first_name:"validFirstName",
         last_name:"validLastName",
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch("/profile/update")
         .set("Authorization",dummyUserToken)
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate first_name parameter and respond with VALIDATION_ERROR when first_name is undefined",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         // no first_name parameter
         last_name:"validLastName",
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate first_name parameter and respond with VALIDATION_ERROR when first_name is invalid characther length",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"",
         last_name:"validLastName",
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate last_name parameter and respond with VALIDATION_ERROR when last_name is undefined",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         //no last_name parameter
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch("/profile/update")
         .set("Authorization",dummyUserToken)
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate last_name parameter and respond with VALIDATION_ERROR when last_name is invalid characther length",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"", // less than 3 char last_name parameter
         contact:"600000000000",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate contact parameter and respond with VALIDATION_ERROR when contact is undefined",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"validLastName", 
         //no contact parameter
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate contact parameter and respond with VALIDATION_ERROR when contact is invalid characther length",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"validLastName",
         contact:"", // less than 7-15 digit contact
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate contact parameter and respond with VALIDATION_ERROR when contact contain invalid characther",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"validLastName", 
         contact:"invalidContact",
         address:"validAddress"
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate address parameter and respond with VALIDATION_ERROR when address is undefined",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"validLastName", 
         contact:"600000000000",
         // no address paramete
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/update should validate address parameter and respond with VALIDATION_ERROR_004 when address is invalid length",async ()=>{
      const updateData: UserUpdateProfileParam={
         user_name:"validUsername",
         first_name:"validFirstName",
         last_name:"validLastName", 
         contact:"600000000000",
         address:""
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   // User PATCH /profile/update logic success
   
   it("PATCH /profile/update should update username if userInput.user_name is not null and validated", async ()=>{
      const updateData:UserUpdateProfileParam={
         user_name:"new_username",
         first_name:null,
         last_name:null,
         contact:null,
         address:null
      }
      const response = await request(serverApp)
         .patch('/profile/update')
         .set({"Authorization":dummyUserToken})
         .send(updateData);
      expect(profileSet_UpdateAt).toHaveBeenCalled();
      expect(profileSet_Username).toHaveBeenCalledWith("new_username");
   })

   it("PATCH /profile/update should update first_name if userInput.first_name is not null and validated",async()=>{
      const updateData:UserUpdateProfileParam = {
         user_name:null,
         first_name:"new_firstname",
         last_name:null,
         contact:null,
         address:null
      }
      const response = await request(serverApp).patch("/profile/update")
          .set({"Authorization":dummyUserToken})
          .send(updateData)
      expect(profileSet_UpdateAt).toHaveBeenCalled();
      expect(profileSet_FirstName).toHaveBeenCalledWith("new_firstname");
   })

   it("PATCH /profile/update should update last_name if userInput.last_name is not null and validated",async()=>{
      const updateData:UserUpdateProfileParam = {
         user_name:null,
         first_name:null,
         last_name:"new_lastName",
         contact:null,
         address:null
      }
      const response = await request(serverApp).patch("/profile/update")
          .set({"Authorization":dummyUserToken})
          .send(updateData)
      expect(profileSet_UpdateAt).toHaveBeenCalled();
      expect(profileSet_LastName).toHaveBeenCalledWith("new_lastName");
   })

   it("PATCH /profile/update should update contact if userInput.contact is not null and validated",async()=>{
      const updateData:UserUpdateProfileParam = {
         user_name:null,
         first_name:null,
         last_name:null,
         contact:"0000000",
         address:null
      }
      const response = await request(serverApp).patch("/profile/update")
          .set({"Authorization":dummyUserToken})
          .send(updateData)
      expect(profileSet_UpdateAt).toHaveBeenCalled();
      expect(profileSet_Contact).toHaveBeenCalledWith("0000000");
   })

   it("PATCH /profile/update should update address if userInput.address is not null and validated",async()=>{
      const updateData:UserUpdateProfileParam = {
         user_name:null,
         first_name:null,
         last_name:null,
         contact:null,
         address:"new_address"
      }
      const response = await request(serverApp).patch("/profile/update")
          .set({"Authorization":dummyUserToken})
          .send(updateData)
      expect(profileSet_UpdateAt).toHaveBeenCalled();
      expect(profileSet_Address).toHaveBeenCalledWith("new_address");
   })

   it("PATCH /profile/update should update update_at anytime any user date updated",async()=>{
      const updateData:UserUpdateProfileParam = {
         user_name:null,
         first_name:null,
         last_name:null,
         contact:null,
         address:"new_address"
      }
      const response = await request(serverApp).patch("/profile/update")
          .set({"Authorization":dummyUserToken})
          .send(updateData)
      expect(profileSet_UpdateAt).toHaveBeenCalled();
   })

   it("PATCH /profile/update can call Profile controller with null value",async()=>{
      const updateData:UserUpdateProfileParam = {
         user_name:null,
         first_name:null,
         last_name:null,
         contact:null,
         address:null
      }
      const response = await request(serverApp).patch("/profile/update")
          .set({"Authorization":dummyUserToken})
          .send(updateData)
      expect(profileSet_Address).toHaveBeenCalledWith(null);
      expect(profileSet_Contact).toHaveBeenCalledWith(null);
      expect(profileSet_FirstName).toHaveBeenCalledWith(null);
      expect(profileSet_LastName).toHaveBeenCalledWith(null);
      expect(profileSet_Username).toHaveBeenCalledWith(null);
   })


   // PATCH Librarian
   // Librarian PATCH /profile/librarian/update logic error
   
   it("PATCH /profile/librarian/update should return with CLIENT_ERROR_002 if user is not a librarian", async()=>{
      const response = await request(serverApp).patch("/profile/librarian/update")
      expect(response.status).toBe(401);
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
      expect(response.body.name).toBe("CLIENT_ERROR");
   })

   it("PATCH /profile/librarian/update should responds with VALIDATION_ERROR when total_fines parameter is undefined", async()=>{
      const invalidInput = {
         status:"ACTIVE",
         email:"dummyEmail@example.com",
      }
      const response = await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(invalidInput);
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/librarian/update should responds with VALIDATION_ERROR when status attributes is undefined", async()=>{
      const invalidInput = {
         email:"dummyEmail@example.com",
         total_fines : 21.22
      }
      const response = await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(invalidInput);
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/librarian/update should responds with VALIDATION_ERROR when email attributes is undefined", async()=>{
      const invalidInput = {
         status:"ACTIVE",
         total_fines : 21.22,
      }
      const response = await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(invalidInput);
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/librarian/update should responds with VALIDATION_ERROR when email attributes is null", async()=>{
      const invalidInput = {
         status:"ACTIVE",
         total_fines : 21.22,
         email: null
      }
      const response = await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(invalidInput);
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })


   it("PATCH /profile/librarian/update should responds with VALIDATION_ERROR when status input is an invalid",async ()=>{
      const librarianInput:LibrarianUpdateProfileParam = {
         total_fines:21.22,
         email:"dummyEmail@example.com",
         status:"invalid_status"
      }
      const response = await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(librarianInput)
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   it("PATCH /profile/librarian/update should responds with VALIDATION_ERROR when email input is an invalid format",async ()=>{
      const librarianInput:LibrarianUpdateProfileParam = {
         total_fines:21.22,
         email:"invalidEmail",
         status:"ACTIVE"
      }
      const response = await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(librarianInput)
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("VALIDATION_ERROR");
   })

   // librarian PATCH /profile/librarian/update success logic

   it("PATCH /profile/librarian/update should Profile.set_status attributes",async()=>{
      const librarianInput:LibrarianUpdateProfileParam={
         total_fines:21.22,
         email:"dummyEmail@example.com",
         status:"SUSPENDED"
      }
      const response =  await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(librarianInput)
      expect(profileSet_Status).toHaveBeenCalled();
      expect(response.status).toBe(200);
   })

   it("PATCH /profile/librarian/update should call Profile.set_fines attributes",async()=>{
      const librarianInput:LibrarianUpdateProfileParam={
         total_fines:21.22,
         email:"dummyEmail@example.com",
         status:"SUSPENDED"
      }
      const response =  await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(librarianInput)
      expect(profileSet_fines).toHaveBeenCalled();
      expect(response.status).toBe(200);
   })

   it("PATCH /profile/librarian/update total_fines and status can be called with type null",async()=>{
      const librarianInput:LibrarianUpdateProfileParam={
         total_fines:null,
         email:"dummyEmail@example.com",
         status:null,
      }
      const response =  await request(serverApp)
         .patch("/profile/librarian/update")
         .set({"Authorization":dummyLibrarianToken})
         .send(librarianInput)
      expect(profileSet_Status.mock.calls[0][0]).toBeNull();
      expect(profileSet_fines.mock.calls[0][0]).toBeNull();
      expect(response.status).toBe(200);
   })

   // PATCH membership date /profile/subscribe logic error
   
   it("PATCH /profile/subscribe will should return error when request is unauthorized",async()=>{
      const response = await request(serverApp).patch("/profile/subscribe");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
   })

   
   it("PATCH /profile/subscribe will throw an CLIENT_ERROR_006 if user is already a member",async()=>{
      const response = await request(serverApp).patch("/profile/subscribe").set({"Authorization":dummyMemberUserToken});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Invalid_Request);
   })

   it("PATCH /profile/subscribe will throw an CLIENT_ERROR_006 if user is already a librarian",async()=>{
      const response = await request(serverApp).patch("/profile/subscribe").set({"Authorization":dummyLibrarianToken});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Invalid_Request);
   })

   // PATCH membership date/profile/subscribe logic success
   
   it("PATCH /profile/subscribe will call profile.set_memberDate",async()=>{
      const response = await request(serverApp).patch("/profile/subscribe").set({"Authorization":dummyUserToken});
      expect(response.status).toBe(200);
      expect(profileSet_memberDate).toHaveBeenCalled();
   })

   it("PATCH /profile/subscribe will call user.setRole and set role the current user to a MEMBER",async()=>{
      const response =  await request(serverApp).patch("/profile/subscribe").set({"Authorization":dummyUserToken});
      expect(response.status).toBe(200);
      expect(userSet_role).toHaveBeenCalled();
      expect(userSet_role).toHaveBeenCalledWith(UserRole.MEMBER);
   })
})
