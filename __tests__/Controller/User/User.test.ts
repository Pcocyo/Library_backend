import User from "../../../src/Controller/User/User.ts";
import { UserRole } from "../../../src/Controller/User/User";
import prisma from "../../../src/prismaClient";
import { Prisma } from "@prisma/client";
import { resolve } from "path";
import { ClientError, ClientErrorCode } from "../../../src/Errors/ClientError.ts";

describe("User class test", () => {
    const dummyId = "dummyId";
    const dummyEmail: string = "dummyEmail";
    const dummyPassword: string = "dummyPassword";
    const dummyRole: UserRole = UserRole.GUEST;
    const dummyDate: Date = new Date();
    let dummyUser: User;

    beforeEach(() => {
        dummyUser = User.tests__createTestUser(
            dummyId,
            dummyEmail,
            dummyPassword,
            dummyRole,
            dummyDate,
        );
    });

    it("Generate correct user email", () => {
        expect(dummyUser.getEmail()).toBe(dummyEmail);
    });

    it("Generate correct user password", () => {
        expect(dummyUser.getPassword()).toBe(dummyPassword);
    });

    it("Generate correct user role", () => {
        expect(dummyUser.getUserRole()).toBe(dummyRole);
    });

    it("Generate correct user data data", () => {
        expect(dummyUser.getCreatedAt()).toBe(dummyDate);
    });

});

describe("database test suite", () => {
    const dummyEmail = "dummyEmail";
    const dummyPassword = "dummyPassword";
    const dummyRole = null;
    let newUser: User;
    let dummyDbUser: User;

    beforeEach(async () => {
        try {
            dummyDbUser = await User.tests__createDbTestUser({
                email: dummyEmail,
                password: dummyPassword,
                role: dummyRole,
            });
        } catch (error) {
            await prisma.users.delete({
                where: {
                    user_id: dummyDbUser.getId(),
                },
            });
            console.log(error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await prisma.users.delete({
                where: {
                    user_id: dummyDbUser.getId(),
                },
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    });
    it("creates a user in DB with email, password, role, ID, and creation date", async () => {
        try {
            newUser = await User.createNewUser({
                email: "dummyEmail2",
                password: dummyPassword,
                role: dummyRole,
            });

            let dbUser = prisma.users.findUnique({
                where: {
                    email: "dummyEmail2",
                },
            });
            expect(dbUser).not.toBeNull();
            expect(newUser.getEmail()).toEqual("dummyEmail2");
            expect(newUser.getId()).not.toBeNull();
            expect(newUser.getPassword()).toEqual(dummyPassword);
            expect(newUser.getUserRole()).toEqual(UserRole.GUEST);
            expect(newUser.getCreatedAt()).not.toBeNull();

            await prisma.users.delete({
                where: {
                    email: "dummyEmail2",
                },
            });
        } catch (e) {
            await prisma.users.delete({
                where: {
                    email: "dummyEmail2",
                },
            });
            console.log(e);
            throw e;
        }
    });

    it("Throw an error when duplicate user input existed", async () => {
        let errorUser: User;
        try {

            expect(async()=>{
            errorUser = await User.createNewUser({
                email: dummyDbUser.getEmail(),
                password: dummyDbUser.getPassword(),
                role: dummyDbUser.getUserRole(),
                });
            }).rejects.toThrow()

        } catch (error) {
            expect(
                error instanceof Prisma.PrismaClientKnownRequestError,
            ).toBeTruthy();
        }
    });

    it("Return a User domain model when getUserEmail() function called", async () => {
        try {
            let userGot: User = await User.getUserByEmail({
                email: dummyDbUser.getEmail(),
            });
            expect(userGot).not.toBeNull();
            expect(userGot).toBeInstanceOf(User);
        } catch (error) {
            console.log(error);
        }
    });

    it("Return ClientError CLIENT_ERROR_004 when getUserEmail() does not found a user", async () => {
        let userGot: User;
        try {
            userGot = await User.getUserByEmail({
                    email: "invalidEmail",
            });
        } catch (error) {
            const clientError:ClientError = error as ClientError;
            expect(clientError instanceof ClientError);
            expect(clientError.httpsStatusCode).toBe(400);
            expect(clientError.code).toBe(ClientErrorCode.Email_Not_Found);
        }
    });

    it("Delete a user when deleteUser() method called", async () => {
        try{
            let newDummyUser = await prisma.users.create({data:{
                email:"dummyUser2",
                password: "dummyUserPassword",
            }})
            expect(
                User.deleteUser({id:newDummyUser.user_id,email:newDummyUser.email})
            ).resolves.not.toThrow();
        }catch(error){
            console.log(error);
        }
    });

    it("Throw error when deleteUser() method called with invalid data", async () => {
        try{
             expect(
                await User.deleteUser({id:"Unexist id",email:"Unexist email"})
            ).resolves.toThrow();
        }catch(error){
        }
    });

    it("Update user email when setUser() object method called",async () => {
        const newDummyUserEmail:string ="newDummyUserEmail"
        try{
            //expect to work
            await dummyDbUser.setEmail(newDummyUserEmail)
            expect(dummyDbUser.getEmail()).toEqual(newDummyUserEmail)
            await expect(dummyDbUser.setEmail("changeUserEmail")).resolves.not.toThrow()
        }catch(error){
            console.log(error);
        }
    });

    it("Do not update user email when setUser() object method called with null parameter",async () => {
        const newDummyUserEmail:null = null;
        try{
            //expect to work
            await dummyDbUser.setEmail(newDummyUserEmail)
            expect(dummyDbUser.getEmail()).toEqual(dummyEmail)
        }catch(error){
            console.log(error);
        }
    });


    it("Update user role when setRole() object instance method called",async () => {
        const newUserRole:UserRole = UserRole.MEMBER
        try{
            //expect to work
            await dummyDbUser.setRole(newUserRole)
            expect(dummyDbUser.getUserRole()).toEqual(newUserRole);
            await expect(dummyDbUser.setRole(UserRole.LIBRARIAN)).resolves.not.toThrow()
        }catch(error){
            console.log(error);
        }
    });

    it("Do not update user role when setRole() object method called with null parameter",async () => {
        const nullDummyUserRole:null = null;
        try{
            //expect to work
            await dummyDbUser.setEmail(nullDummyUserRole)
            expect(dummyDbUser.getUserRole()).toEqual(UserRole.GUEST);
        }catch(error){
            console.log(error);
        }
    });

    it("Update user password when setRole() object instance method called",async () => {
        const newDummyPassword:string = "newDummyPassword"
        try{
            //expect to work
            await dummyDbUser.setPassword(newDummyPassword)
            expect(dummyDbUser.getPassword()).toEqual(newDummyPassword);
            await expect(dummyDbUser.setPassword("newDummyPassword2")).resolves.not.toThrow()
        }catch(error){
            console.log(error);
        }
    });

    it("Do not update user password when setPassword() object method called with null parameter",async () => {
        const nullDummyPassword:null = null;
        try{
            //expect to work
            await dummyDbUser.setEmail(nullDummyPassword)
            expect(dummyDbUser.getPassword()).toEqual(dummyPassword)
        }catch(error){
            console.log(error);
        }
    });

});
