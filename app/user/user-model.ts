export class UserDTO {

  constructor(data:Partial<UserDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  username?: string|null;
  fullName?: string|null;
  email?: string|null;
  passwordHash?: string|null;
  isActive?: boolean|null;
  createdAt?: string|null;
  userRoleRoles?: number[]|null;

}
