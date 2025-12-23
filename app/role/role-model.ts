export class RoleDTO {

  constructor(data:Partial<RoleDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  roleName?: string|null;
  description?: string|null;
  roleResources?: number[]|null;

}
