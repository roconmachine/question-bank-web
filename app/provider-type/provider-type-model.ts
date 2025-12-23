export class ProviderTypeDTO {

  constructor(data:Partial<ProviderTypeDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  name?: string|null;
  updatedBy?: string|null;

}
