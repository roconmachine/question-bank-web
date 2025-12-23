import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ExamDTO } from 'app/exam/exam-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    name: yup.string().emptyToNull().max(150).required(),
    provider: yup.number().integer().emptyToNull().required()
  });
}

export default function ExamAdd() {
  const { t } = useTranslation();
  useDocumentTitle(t('exam.add.headline'));

  const navigate = useNavigate();
  const [providerValues, setproviderValues] = useState<Map<number,string>>(new Map());
  const [formError, setFormError] = useState<string|undefined>(undefined);

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareRelations = async () => {
    try {
      const response = await axios.get('/api/contentProviders');
      const providersMap = new Map<number, string>();
      response.data.forEach((item: any) => {
        providersMap.set(item.id, item.name);
      });
      setproviderValues(providersMap);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareRelations();
  }, []);

  const createExam = async (data: ExamDTO) => {
    window.scrollTo(0, 0);
    try {
      // normalize form values and coerce types (selects may return strings)
      const normalized: any = { ...data };
      if (normalized.provider !== undefined && normalized.provider !== null && normalized.provider !== '') {
        const num = Number(normalized.provider);
        normalized.provider = Number.isNaN(num) ? normalized.provider : num;
      } else {
        normalized.provider = null;
      }
      // attach username from sessionStorage as updatedBy
      const username = (() => {
        try { return sessionStorage.getItem('username') || undefined; } catch (e) { return undefined; }
      })();
      const payload = { ...normalized, updatedBy: username, shapeType: 'SVG' };
      console.log('Payload:', payload);
      await axios.post('/api/exams', payload);
      setFormError(undefined);
      navigate('/exams', {
            state: {
              msgSuccess: t('exam.create.success')
            }
          });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const resp = error.response;
        if (resp) {
          const data = resp.data as any;
          if (data?.fieldErrors && useFormResult.setError) {
            handleServerError(error, navigate, useFormResult.setError, t);
            return;
          }
          const serverMessage = data?.message || data?.error || resp.statusText || ('Server error: ' + resp.status);
          setFormError(serverMessage);
          return;
        }
        setFormError(t('server.unavailable') || 'Server unavailable');
        return;
      }
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('exam.add.headline')}</h1>
      <div>
        <Link to="/exams" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('exam.add.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(createExam)} noValidate>
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {formError}
        </div>
      )}
      <InputRow useFormResult={useFormResult} object="exam" field="name" required={true} />
      <InputRow useFormResult={useFormResult} object="exam" field="provider" required={true} type="select" options={providerValues} />
      <input type="submit" value={t('exam.add.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
