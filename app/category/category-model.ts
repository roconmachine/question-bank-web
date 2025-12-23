export class CategoryDTO {

  constructor(data:Partial<CategoryDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  name?: string|null;
  updatedBy?: string|null;
  parent?: number|null;

}
