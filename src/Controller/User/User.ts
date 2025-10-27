export enum UserRole {
  MEMBER,
  LIBRARIAN,
  GUEST,
}

export default class User {
  private email: string;
  private password: string;
  private role: UserRole;
  private created_at: Date;

  public constructor(
    email: string,
    password: string,
    role: UserRole,
    created_at: Date,
  ) {
    this.password = password;
    this.email = email;
    this.role = role;
    this.created_at = created_at;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getUserRole(): UserRole {
    return this.role;
  }

  public getCreatedAt(): Date {
    return this.created_at;
  }

  public setEmail(newEmail: string) {
    this.email = newEmail;
  }

     
  public setPassword(newPassword: string) {
    this.password = newPassword;
  }

  public setRole(newRole: UserRole) {
    this.role = newRole;
  }
}

