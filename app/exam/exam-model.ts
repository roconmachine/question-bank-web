export class ExamDTO {

  constructor(data:Partial<ExamDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  name?: string|null;
  updatedBy?: string|null;
  provider?: number|null;

}
