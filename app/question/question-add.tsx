import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { QuestionDTO } from 'app/question/question-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    questionText: yup.string().emptyToNull().required(),
    correctScore: yup.string().emptyToNull().numeric(5, 2),
    incorrectScore: yup.string().emptyToNull().numeric(5, 2),
    lang: yup.string().emptyToNull().max(20),
    shapeData: yup.string().emptyToNull(),
    updatedBy: yup.string().emptyToNull().max(100),
    optA: yup.string().emptyToNull().max(255),
    optB: yup.string().emptyToNull().max(255),
    optC: yup.string().emptyToNull().max(255),
    optD: yup.string().emptyToNull().max(255),
    answer: yup.string().emptyToNull().max(255).required(),
    set: yup.number().integer().emptyToNull().required(),
    category: yup.number().integer().emptyToNull(),
    questionTagTags: yup.array(yup.number().required()).emptyToNull().json()
  });
}

export default function QuestionAdd() {
  const { t } = useTranslation();
  useDocumentTitle(t('question.add.headline'));

  const navigate = useNavigate();
  const [setValues, setSetValues] = useState<Map<number,string>>(new Map());
  const [categoryValues, setCategoryValues] = useState<Map<number,string>>(new Map());
  const [questionTagTagsValues, setQuestionTagTagsValues] = useState<Map<number,string>>(new Map());

  //const [formError, setFormError] = useState<string|undefined>(undefined);

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: {
      correctScore: '1',
      incorrectScore: '0'
    }
  });

  const prepareRelations = async () => {
    try {
      const setValuesResponse = await axios.get('/api/questions/setValues');
      setSetValues(setValuesResponse.data);
      const categoryValuesResponse = await axios.get('/api/questions/categoryValues');
      setCategoryValues(categoryValuesResponse.data);
      const questionTagTagsValuesResponse = await axios.get('/api/questions/questionTagTagsValues');
      setQuestionTagTagsValues(questionTagTagsValuesResponse.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareRelations();
  }, []);

  const createQuestion = async (data: QuestionDTO) => {
    window.scrollTo(0, 0);
    try {
      const username = (() => {
        try { return sessionStorage.getItem('username') || undefined; } catch (e) { return undefined; }
      })();
      const payload = { ...data, updatedBy: username, shapeType: 'SVG', status: 'Created' };
      await axios.post('/api/questions', payload);
      navigate('/questions', {
            state: {
              msgSuccess: t('question.create.success')
            }
          });
    } catch (error: any) {
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  const handleQuestionTextBlur = (e: any) => {
    alert('hi' + e  );
    // const val: string = (e && e.target && e.target.value) || '';
    // if (!val) return;
    // const banglaRegex = /[\u0980-\u09FF]+/g;
    // const transformed = val.replace(banglaRegex, (match, offset, str) => {
    //   if (offset > 0 && str[offset - 1] === '$') return match;
    //   return '$' + match;
    // });
    // if (transformed !== val) {
    //   useFormResult.setValue('questionText', transformed, { shouldDirty: true, shouldTouch: true });
    // }
  };

return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('question.add.headline')}</h1>
      <div>
        <Link to="/questions" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('question.add.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(createQuestion)} noValidate>
      <InputRow useFormResult={useFormResult} object="question" field="set" required={true} type="select" options={setValues} />
      <InputRow useFormResult={useFormResult} object="question" field="category" type="select" options={categoryValues} />
      <InputRow useFormResult={useFormResult} object="question" field="questionText" required={true} type="textarea" onBlur={handleQuestionTextBlur} />
      <InputRow useFormResult={useFormResult} object="question" field="optA" />
      <InputRow useFormResult={useFormResult} object="question" field="optB" />
      <InputRow useFormResult={useFormResult} object="question" field="optC" />
      <InputRow useFormResult={useFormResult} object="question" field="optD" />
      <InputRow useFormResult={useFormResult} object="question" field="answer" required={true} type="radio" options={{ A: t('question.optA.label'), B: t('question.optB.label'), C: t('question.optC.label'), D: t('question.optD.label') }} />
      
      <InputRow useFormResult={useFormResult} object="question" field="correctScore" type="number" />
      <InputRow useFormResult={useFormResult} object="question" field="incorrectScore" type="number" />
      <InputRow useFormResult={useFormResult} object="question" field="lang" type="select" options={{ Eng: 'Eng', Ban: 'Ban' }} />
      <InputRow useFormResult={useFormResult} object="question" field="shapeData" type="textarea" />
      <InputRow useFormResult={useFormResult} object="question" field="questionTagTags" type="multiselect" options={questionTagTagsValues} />
      <input type="submit" value={t('question.add.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
