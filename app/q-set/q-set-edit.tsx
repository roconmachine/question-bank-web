import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
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
    status: yup.string().emptyToNull().required(),
    isFree: yup.bool().required()
  });
}

export default function QSetEdit() {
  const { t } = useTranslation();
  useDocumentTitle(t('qSet.edit.headline'));

  const navigate = useNavigate();
  const [examValues, setExamValues] = useState<Map<number,string>>(new Map());
  const statusValues: Record<string,string> = { 'Created': 'Created', 'Edited': 'Edited', 'Published': 'Published' };
  const [formError, setFormError] = useState<string|undefined>(undefined);
  const params = useParams();
  const currentId = +params.id!;

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareForm = async () => {
    try {
      const examValuesResponse = await axios.get('/api/qSets/examValues');
      setExamValues(examValuesResponse.data);
      const data = (await axios.get('/api/qSets/' + currentId)).data;
      useFormResult.reset(data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareForm();
  }, []);

  const updateQSet = async (data: QSetDTO) => {
    window.scrollTo(0, 0);
    try {
      const username = (() => {
        try { return sessionStorage.getItem('username') || undefined; } catch (e) { return undefined; }
      })();
      const payload = { ...data, updatedBy: username };
      await axios.put('/api/qSets/' + currentId, payload);
      setFormError(undefined);
      navigate('/qSets', {
            state: {
              msgSuccess: t('qSet.update.success')
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
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('qSet.edit.headline')}</h1>
      <div>
        <Link to="/qSets" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('qSet.edit.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(updateQSet)} noValidate>
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {formError}
        </div>
      )}
      <InputRow useFormResult={useFormResult} object="qSet" field="id" disabled={true} type="number" />
      <InputRow useFormResult={useFormResult} object="qSet" field="setName" required={true} />
      <InputRow useFormResult={useFormResult} object="qSet" field="exam" required={true} type="select" options={examValues} />
      <InputRow useFormResult={useFormResult} object="qSet" field="status" required={true} type="select" options={statusValues} />
      <InputRow useFormResult={useFormResult} object="qSet" field="isFree" type="checkbox" />
      <input type="submit" value={t('qSet.edit.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
