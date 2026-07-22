import {
    CreateUserDto,
    DeleteUserDto,
    UpdateUserDto,
    GetUserDto,
    LoginUserDto,
    ActivateMembershipDto,
    AssignLibrarianDto,
} from "./dto";
import { IUserRepository, IUserService, IUserServiceConstructor } from "./types";
import { IBcryptService, IJwtService } from "../../../core/security/interfaces";
import { IUserEntity } from "./types";
import { ClientErrorFactory } from "../../../core/error/exceptions";
import { IProfileRepository } from "../profile/types";

export class UserService implements IUserService {
    private readonly bcryptService: IBcryptService;
    private readonly userRepository: IUserRepository;
    private readonly jwtService: IJwtService;
    private readonly profileRepository: IProfileRepository;

    public constructor(constructor: IUserServiceConstructor) {
        this.userRepository = constructor.userRepository;
        this.bcryptService = constructor.bcryptService;
        this.jwtService = constructor.jwtService;
        this.profileRepository = constructor.profileRepository;
    }

    async update(dto: UpdateUserDto): Promise<string> {
        dto.data.password == null
            ? dto.data.password
            : (dto.data.password = await this.bcryptService.hashPassword(dto.data.password));
        const user: IUserEntity = await this.userRepository.update({
            user_id: dto.token.id,
            email: dto.data.email ?? undefined,
            password: dto.data.password ?? undefined,
        });

        let token = this.jwtService.generateJwtToken({
            email: user.getEmail(),
            id: user.getId(),
            role: user.getRole(),
        });
        return token;
    }

    async create(dto: CreateUserDto): Promise<string> {
        dto.password = await this.bcryptService.hashPassword(dto.password);
        let user: IUserEntity = await this.userRepository.create({
            email: dto.email,
            password: dto.password,
        });
        await this.profileRepository.save({ user_id: user.getId() });
        return this.jwtService.generateJwtToken({
            email: user.getEmail(),
            id: user.getId(),
            role: user.getRole(),
        });
    }

    async delete(dto: DeleteUserDto): Promise<void> {
        await this.profileRepository.delete({ user_id: dto.token.id });

        await this.userRepository.delete({
            email: dto.token.email,
            user_id: dto.token.id,
        });
    }

    async findUser(dto: GetUserDto): Promise<IUserEntity> {
        const foundUser = await this.userRepository.getByEmail({
            email: dto.data.email,
        });
        return foundUser;
    }

    async compare(dto: LoginUserDto): Promise<string> {
        try {
            const user = await this.userRepository.getByEmail({
                email: dto.email,
            });
            const correctPassword = await this.bcryptService.comparePassword(dto.password, user.getPassword());

            if (!correctPassword) {
                throw ClientErrorFactory.createIncorrectPasswordError({
                    field: "password",
                    context: { user_request_info: dto },
                });
            }

            const token = this.jwtService.generateJwtToken({
                email: user.getEmail(),
                id: user.getId(),
                role: user.getRole(),
            });
            return token;
        } catch (error: unknown) {
            throw error;
        }
    }

    async activate_membership(dto: ActivateMembershipDto): Promise<string> {
        try {
            const activatedUser: IUserEntity = await this.userRepository.update({
                user_id: dto.data.id,
                role: "MEMBER",
            });
            this.profileRepository.save({
                user_id: activatedUser.getId(),
                membership_date: activatedUser.getUpdatedAt(),
            });
            return this.jwtService.generateJwtToken({
                email: activatedUser.getEmail(),
                role: activatedUser.getRole(),
                id: activatedUser.getId(),
            });
        } catch (error: unknown) {
            throw error;
        }
    }

    async assign_librarian(dto: AssignLibrarianDto): Promise<void> {
        try {
            await this.userRepository.save({
                email: dto.data.email,
                role: "LIBRARIAN",
            });
            return;
        } catch (error: unknown) {
            throw error;
        }
    }
}
