export class QuestionDTO {

  constructor(data:Partial<QuestionDTO>) {
    Object.assign(this, data);
  }

  id?: number|null;
  questionText?: string|null;
  correctScore?: string|null;
  incorrectScore?: string|null;
  lang?: string|null;
  status?: string|null;
  shapeType?: string|null;
  shapeData?: string|null;
  updatedBy?: string|null;
  optA?: string|null;
  optB?: string|null;
  optC?: string|null;
  optD?: string|null;
  answer?: string|null;
  set?: number|null;
  setName?: string|null;
  category?: number|null;
  categoryName?: string|null;

}
