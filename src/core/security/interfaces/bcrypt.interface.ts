export interface IBcryptService{
   hashPassword(plainPassword:string):Promise<string>;
   comparePassword(hashPassword:string,plainPassword:string): Promise<boolean>;
}
