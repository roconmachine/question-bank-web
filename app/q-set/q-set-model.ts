export class QSetDTO {

  constructor(data:Partial<QSetDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  setName?: string|null;
  isFree?: boolean|null;
  status?: string|null;
  updatedBy?: string|null;
  exam?: number|null;

}
