import Profile from "../../../src/Controller/Profile/Profile";
import { ProfileStatus } from "../../../src/Controller/Profile/Profile.interface";
import type {
    CreateProfileParam,
    ProfileParam,
} from "../../../src/Controller/Profile/Profile.interface";
import type { UserRegisterInterface } from "../../../src/Controller/User/User.interface";
import User, { UserRole } from "../../../src/Controller/User/User";
import prisma from "../../../src/prismaClient";
import { ClientError } from "../../../src/Errors";
import { ClientErrorCode } from "../../../src/Errors/ClientError";
describe("Class Tests", () => {
    const dummyId: string = "dummyId";
    const dummyUserName: string = "dummyUserName";
    const dummyFirstName: string = "dummyFirstName";
    const dummyLastName: string = "dummyLastName";
    const dummyContact: string = "dummyContact";
    const dummyAddress: string = "dummyAddress";
    const dummy_MemberShip_Date = new Date();
    const dummyStatus: ProfileStatus = ProfileStatus.ACTIVE;
    const dummyTotalFines: number = 0.0;
    const dummyUpdated_At: Date = new Date();

    const dummyProfileParams: ProfileParam = {
        user_id: dummyId,
        user_name: dummyUserName,
        first_name: dummyFirstName,
        last_name: dummyLastName,
        contact: dummyContact,
        address: dummyAddress,
        membership_date: dummy_MemberShip_Date,
        status: dummyStatus,
        total_fines: dummyTotalFines,
        updated_at: dummyUpdated_At,
    };

    let dummyProfile: Profile;
    beforeEach(() => {
        dummyProfile = Profile.Tests__CreateProfile__(dummyProfileParams);
    });

    it("Should create a new profile when called", () => {
        let newProfile = Profile.Tests__CreateProfile__(dummyProfileParams);
        expect(newProfile.get_userId()).toBe(dummyId);
        expect(newProfile.get_userName()).toBe(dummyUserName);
        expect(newProfile.get_firstName()).toBe(dummyFirstName);
        expect(newProfile.get_lastName()).toBe(dummyLastName);
        expect(newProfile.get_contact()).toBe(dummyContact);
        expect(newProfile.get_address()).toBe(dummyAddress);
        expect(newProfile.get_memberDate()).toBe(dummy_MemberShip_Date);
        expect(newProfile.get_status()).toBe(dummyStatus);
        expect(newProfile.get_updatedAt()).toBe(dummyUpdated_At);
    });
});

describe("Profile table tests", () => {
    let dummyCreateProfileParams: CreateProfileParam;
    let dummyProfile: Profile;
    const dummyProfile_UserName: string = "dummyUserName";
    const dummyProfile_FirstName: string = "dummyFirstName";
    const dummyProfile_LastName: string = "dummyLastName";
    const dummyProfile_Contact: string = "dummyContact";
    const dummyProfile_Address: string = "dummyAddress";
    const dummyProfile__MemberShip_Date: Date = new Date();
    const dummyProfile_Updated_At: Date = new Date();

    // for user creation;
    const dummyUserEmail: string = "dummyEmail";
    const dummyUserPassword: string = "dummyPassword";
    const dummyUserRole: UserRole = UserRole.GUEST;
    const dummyUserData: UserRegisterInterface = {
        email: dummyUserEmail,
        password: dummyUserPassword,
        role: dummyUserRole,
    };
    let dummyUser: User;

    beforeAll(async () => {
        try {
            dummyUser = await User.createNewUser(dummyUserData);
        } catch (err) {
            console.log(err);
        }
    });
    beforeEach(async () => {
        dummyCreateProfileParams = {
            user_id: dummyUser.getId(),
            user_name: dummyProfile_UserName,
            first_name: dummyProfile_FirstName,
            last_name: dummyProfile_LastName,
            contact: dummyProfile_Contact,
            address: dummyProfile_Address,
            membership_date: dummyProfile__MemberShip_Date,
            updated_at: dummyProfile_Updated_At,
        };
        try {
            dummyProfile = await Profile.CreateProfile(
                dummyCreateProfileParams,
            );
        } catch (err) {
            console.log(err);
        }
    });

    afterAll(async () => {
        await prisma.users.delete({ where: { user_id: dummyUser.getId() } });
    });

    afterEach(async () => {
        await prisma.profiles.delete({
            where: { user_id: dummyProfile.get_userId() },
        });
    });

    //Create Profile tests
    it("Profile.CreateProfile should create a profile records with all required fields populated correctly", async () => {
        let profile = await prisma.profiles.findUnique({
            where: {
                user_id: dummyUser.getId(),
            },
        });
        expect(profile).not.toBeNull();
        expect(profile?.user_id).toBe(dummyUser.getId());
        expect(profile?.user_name).toBe(dummyProfile_UserName);
        expect(profile?.first_name).toBe(dummyProfile_FirstName);
        expect(profile?.last_name).toBe(dummyProfile_LastName);
        expect(profile?.contact).toBe(dummyProfile_Contact);
        expect(profile?.address).toBe(dummyProfile_Address);
        expect(profile?.membership_date).toStrictEqual(
            dummyProfile__MemberShip_Date,
        );
        expect(profile?.updated_at).toStrictEqual(dummyProfile_Updated_At);
        expect(profile?.status).not.toBeNull();
        expect(profile?.total_fines).not.toBeNull();
    });
    it("Profile.CreateProfile should return Profile object", () => {
        expect(dummyProfile).toBeInstanceOf(Profile);
    });

    it("Profile.DeleteProfile should delete a record when user_id input", async () => {
        let newDummyUser = await User.createNewUser({
            email: "dummyUser2email",
            password: "dummyUserPassword",
            role: null,
        });
        let dummyProfile2 = await Profile.CreateProfile({
            user_id: newDummyUser.getId(),
        });

        await Profile.DeleteProfile(dummyProfile2);
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile2.get_userId() },
        });
        expect(profile).toBeNull();
        await prisma.users.delete({ where: { user_id: newDummyUser.getId() } });
    });

    //Get Profile by user id tests

    it("Profile.GetByUserId should return the correct profile records and Profile object", async () => {
        let dbDummyProfile: Profile;
        dbDummyProfile = await Profile.GetByUserId({
            user_id: dummyUser.getId(),
        });

        expect(dbDummyProfile.get_userId()).toBe(dummyProfile.get_userId());
        expect(dbDummyProfile.get_firstName()).toBe(
            dummyProfile.get_firstName(),
        );
        expect(dbDummyProfile).toBeInstanceOf(Profile);
    });

    it("Profile.GetByUserId should return ClientError class with CLIENT_ERROR_005 code when profile records did not exists", async () => {
        try {
            await Profile.GetByUserId({
                user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            });
        } catch (err:any) {
            const clientError:ClientError = err as ClientError;
            expect(clientError instanceof ClientError).toBeTruthy();
            expect(clientError.httpsStatusCode).toBe(400);
            expect(clientError.code).toBe(ClientErrorCode.User_Id_Not_Found);
        }
    });

    // update Profile tests
    it("Profile_Object.set_userName should update profile user_name records", async () => {
        try {
            await dummyProfile.set_userName("newDummyUsername");
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.user_name).toBe("newDummyUsername");
        expect(dummyProfile.get_userName()).toBe("newDummyUsername");
    });

    it("Profile_Object.set_firstName should update profile first_name records", async () => {
        try {
            await dummyProfile.set_firstName("newDummyFirstName");
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.first_name).toBe("newDummyFirstName");
        expect(dummyProfile.get_firstName()).toBe("newDummyFirstName");
    });

    it("Profile_Object.set_lastName should update profile last_name records", async () => {
        try {
            await dummyProfile.set_lastName("newDummyLastName");
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.last_name).toBe("newDummyLastName");
        expect(dummyProfile.get_lastName()).toBe("newDummyLastName");
    });

    it("Profile_Object.set_contact should update profile contact records", async () => {
        try {
            await dummyProfile.set_contact("newDummyContact");
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.contact).toBe("newDummyContact");
        expect(dummyProfile.get_contact()).toBe("newDummyContact");
    });

    it("Profile_Object.set_address should update profile address records", async () => {
        try {
            await dummyProfile.set_address("newDummyAddress");
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.address).toBe("newDummyAddress");
        expect(dummyProfile.get_address()).toBe("newDummyAddress");
    });

    it("Profile_Object.set_memberDate should update profile memberDate records", async () => {
        let newMemberDate = new Date();
        try {
            await dummyProfile.set_memberDate(newMemberDate);
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.membership_date).toStrictEqual(newMemberDate);
        expect(dummyProfile.get_memberDate()).toStrictEqual(newMemberDate);
    });

    it("Profile_Object.set_status should update profile status records", async () => {
        try {
            await dummyProfile.set_status(ProfileStatus.SUSPENDED);
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.status).toBe(ProfileStatus.SUSPENDED.toString());
        expect(dummyProfile.get_status()).toBe(ProfileStatus.SUSPENDED);
    });

    it("Profile_Object.set_fines should update profile total_fines records", async () => {
        try {
            await dummyProfile.set_fines(2.5);
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.total_fines.toNumber()).toBe(2.5);
        expect(dummyProfile.get_totalFines()).toBe(2.5);
    });

    it("Profile_Object.set_updatedAt should update profile updated_at records", async () => {
        let newUpdateAtDate = new Date();
        try {
            await dummyProfile.set_updatedAt(newUpdateAtDate);
        } catch (err) {
            console.log(err);
        }
        let profile = await prisma.profiles.findUnique({
            where: { user_id: dummyProfile.get_userId() },
        });
        expect(profile?.updated_at).toStrictEqual(newUpdateAtDate);
        expect(dummyProfile.get_updatedAt()).toStrictEqual(newUpdateAtDate);
    });
});
