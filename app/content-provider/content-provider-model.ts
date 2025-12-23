export class ContentProviderDTO {

  constructor(data:Partial<ContentProviderDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  name?: string|null;
  email?: string|null;
  website?: string|null;
  description?: string|null;
  updatedBy?: string|null;
  providerType?: number|null;

}
