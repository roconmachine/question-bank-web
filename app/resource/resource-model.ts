export class ResourceDTO {

  constructor(data:Partial<ResourceDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  resourceName?: string|null;
  resourceType?: string|null;
  resourcePath?: string|null;
  parent?: number|null;

}
