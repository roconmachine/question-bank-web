import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { QSetDTO } from 'app/q-set/q-set-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    setName: yup.string().emptyToNull().max(150).required(),
    exam: yup.number().integer().emptyToNull().required(),
    isFree: yup.bool().required(),
  });
}

export default function QSetAdd() {
  const { t } = useTranslation();
  useDocumentTitle(t('qSet.add.headline'));

  const navigate = useNavigate();
  const [examValues, setExamValues] = useState<Map<number,string>>(new Map());
  const [formError, setFormError] = useState<string|undefined>(undefined);

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareRelations = async () => {
    try {
      const examValuesResponse = await axios.get('/api/qSets/examValues');
      setExamValues(examValuesResponse.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareRelations();
  }, []);

  const createQSet = async (data: QSetDTO) => {
    window.scrollTo(0, 0);
    try {
      // normalize types coming from form (react-hook-form returns strings for selects)
      const normalized: any = { ...data };
      if (normalized.exam !== undefined && normalized.exam !== null && normalized.exam !== '') {
        const num = Number(normalized.exam);
        normalized.exam = Number.isNaN(num) ? normalized.exam : num;
      } else {
        normalized.exam = null;
      }
      // attach username from sessionStorage as updatedBy
      const username = (() => {
        try { return sessionStorage.getItem('username') || undefined; } catch (e) { return undefined; }
      })();
      const payload = { ...normalized, updatedBy: username };
       await axios.post('/api/qSets', payload);
      // success: clear any existing form error and navigate
      setFormError(undefined);
      console.log('bad request');
      
      navigate('/qSets', {
            state: {
              msgSuccess: t('qSet.create.success')
            }
          });
    } catch (error: any) {

      if(error.response){
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);
        setFormError(error.response.data.message || 'An error occurred');
        // return;
      }
      // fallback for non-axios errors: navigate to error page
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('qSet.add.headline')}</h1>
      <div>
        <Link to="/qSets" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('qSet.add.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(createQSet)} noValidate>
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {formError}
        </div>
      )}
      <InputRow useFormResult={useFormResult} object="qSet" field="setName" required={true} />
      <InputRow useFormResult={useFormResult} object="qSet" field="exam" required={true} type="select" options={examValues} />
      <InputRow useFormResult={useFormResult} object="qSet" field="isFree" required={true} type="checkbox" />
      <input type="submit" value={t('qSet.add.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
