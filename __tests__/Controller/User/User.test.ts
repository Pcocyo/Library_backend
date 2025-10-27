import User from "../../../src/Controller/User/User";
import { UserRole } from "../../../src/Controller/User/User";

describe("User class test",()=>{
    const dummyEmail:string = "dummyEmail";
    const dummyPassword:string = "dummyPassword";
    const dummyRole:UserRole = UserRole.GUEST;
    const dummyDate:Date = new Date();
    let dummyUser:User;

    beforeEach(()=>{
       dummyUser  = new User(dummyEmail,dummyPassword,dummyRole,dummyDate);
    })

    it("Generate correct user email",()=>{
        expect(dummyUser.getEmail()).toBe(dummyEmail);
    })

    it("Generate correct user password",()=>{
        expect(dummyUser.getPassword()).toBe(dummyPassword);
    })
    
    it("Generate correct user role",()=>{
        expect(dummyUser.getUserRole()).toBe(dummyRole);
    })

    it("Generate correct user data data",()=>{
        expect(dummyUser.getCreatedAt()).toBe(dummyDate);
    })

    it("set correct user data email",()=>{
        const newEmail:string = "newDummyEmail";
        dummyUser.setEmail(newEmail);
        expect(dummyUser.getEmail()).toBe(newEmail);
    })
    
    it("set correct user data password",()=>{
        const newPassword:string = "newDummyPassword";
        dummyUser.setPassword(newPassword);
        expect(dummyUser.getPassword()).toBe(newPassword);
    })

    it("set correct user data role",()=>{
        const newRole:UserRole = UserRole.MEMBER;
        dummyUser.setRole(newRole);
        expect(dummyUser.getUserRole()).toBe(newRole);
    })
})
