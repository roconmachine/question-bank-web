export class PermissionDTO {

  constructor(data:Partial<PermissionDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  action?: string|null;
  resource?: number|null;

}
