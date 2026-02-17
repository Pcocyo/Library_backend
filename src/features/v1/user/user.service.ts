import { CreateUserDto, DeleteUserDto, UpdateUserDto, GetUserDto, LoginUserDto } from "./dto";
import {
    IUserRepository,
    IUserService,
    IUserServiceConstructor,
} from "./types";
import { IBcryptService, IJwtService } from "../../../core/security/interfaces";
import { IUserEntity } from "./types";
import { ErrorMapperGroup } from "../../../core/error/mappers";
import { ClientError, ClientErrorFactory } from "../../../core/error/exceptions";

export class UserService implements IUserService {
    private readonly bcryptService: IBcryptService;
    private readonly userRepository: IUserRepository;
    private readonly jwtService: IJwtService;

    public constructor(constructor: IUserServiceConstructor) {
        this.userRepository = constructor.userRepository;
        this.bcryptService = constructor.bcryptService;
        this.jwtService = constructor.jwtService;
    }
    async update(dto: UpdateUserDto): Promise<string> {
        try {
            dto.data.password == null
                ? dto.data.password
                : (dto.data.password = await this.bcryptService.hashPassword(
                      dto.data.password,
                  ));
            const user: IUserEntity = await this.userRepository.updateUser(dto);
            let token = this.jwtService.generateJwtToken({
                email: user.getEmail(),
                id: user.getId(),
                role: user.getRole(),
            });
            return token;
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    async create(dto: CreateUserDto): Promise<string> {
        try {
            dto.password = await this.bcryptService.hashPassword(dto.password);
            // remember to create new profile when user create new
            let user: IUserEntity =
                await this.userRepository.createNewUser(dto);
            return this.jwtService.generateJwtToken({
                email: user.getEmail(),
                id: user.getId(),
                role: user.getRole(),
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    async delete(dto: DeleteUserDto): Promise<void> {
        try {
            // remember to delete profile when user create new
            await this.userRepository.deleteUser(dto);
        } catch (error) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    async findUser(dto: GetUserDto): Promise<IUserEntity> {
        try {
            const foundUser = await this.userRepository.getUserByEmail(dto);
            return foundUser;
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

   async compare(dto: LoginUserDto): Promise<string> {
      try{
            const user = await this.userRepository.getUserByEmail(dto);
            const correctPassword = await this.bcryptService.comparePassword(
                dto.password,
                user.getPassword(),
            );

            if (!correctPassword) {
                throw ClientErrorFactory.createIncorrectPasswordError({
                    field: "password",
                    context: { user_request_info: dto},
                });
            }

            const token = this.jwtService.generateJwtToken({
                email: user.getEmail(),
                id: user.getId(),
                role: user.getRole(),
            });
         return token;
      }catch(error:unknown){
         if(error instanceof ClientError) throw error;
         throw ErrorMapperGroup.getInstance().mapError(error);
      }
   }
}
