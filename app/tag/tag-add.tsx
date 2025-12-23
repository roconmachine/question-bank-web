import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TagDTO } from 'app/tag/tag-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    tag: yup.string().emptyToNull().max(100).required()
  });
}

export default function TagAdd() {
  const { t } = useTranslation();
  useDocumentTitle(t('tag.add.headline'));

  const navigate = useNavigate();
  const [formError, setFormError] = useState<string|undefined>(undefined);

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const createTag = async (data: TagDTO) => {
    window.scrollTo(0, 0);
    try {
      // attach username from sessionStorage as updatedBy
      const username = (() => {
        try { return sessionStorage.getItem('username') || undefined; } catch (e) { return undefined; }
      })();
      const payload = { ...data, updatedBy: username };
      await axios.post('/api/tags', payload);
      setFormError(undefined);
      navigate('/tags', {
            state: {
              msgSuccess: t('tag.create.success')
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
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('tag.add.headline')}</h1>
      <div>
        <Link to="/tags" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('tag.add.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(createTag)} noValidate>
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {formError}
        </div>
      )}
      <InputRow useFormResult={useFormResult} object="tag" field="tag" required={true} />
      <input type="submit" value={t('tag.add.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
