export class TagDTO {

  constructor(data:Partial<TagDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  tag?: string|null;
  updatedBy?: string|null;

}
