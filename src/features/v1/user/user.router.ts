import { BaseRouter } from "../../../core/base/base.router";
import {
    CreateUserRequestSchema,
    GetUserRequestSchema,
    LoginUserRequestSchema,
    UpdateUserRequestSchema,
} from "./user.schema";
import {
    IAuthMiddleware,
    IValidationMiddleware,
} from "../../../core/middleware/types";
import { IUserController } from "./types";

export class UserRouter extends BaseRouter {
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;
    private readonly userController: IUserController;

    public constructor(authMiddleware:IAuthMiddleware,validationMiddleware:IValidationMiddleware,userController:IUserController) {
        super();
        this.authMiddleware = authMiddleware;
        this.validationMiddleware = validationMiddleware;
        this.userController = userController;
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.post(
            "/create",
            this.validationMiddleware.validate(CreateUserRequestSchema),
            this.userController.createUser,
        );

        this.router.get(
            "/get",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.validationMiddleware.validate(GetUserRequestSchema),
            this.userController.getUser
        );

        this.router.post(
            "/login",
            this.validationMiddleware.validate(LoginUserRequestSchema),
            this.userController.login
        );

        this.router.delete(
            "/delete",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.userController.deleteUser
        );

        this.router.put(
            "/update",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.validationMiddleware.validate(UpdateUserRequestSchema),
            this.userController.updateUser,
        );
       this.router.put(
         "/subscribe",
         this.authMiddleware.CreateValidateTokenMiddleware({option:{required_role:"GUEST"}}),
         this.userController.activate_membership
      )
    }
}
