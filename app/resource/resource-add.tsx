import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResourceDTO } from 'app/resource/resource-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    resourceName: yup.string().emptyToNull().max(150).required(),
    resourceType: yup.string().emptyToNull().max(50).required(),
    resourcePath: yup.string().emptyToNull().max(255),
    parent: yup.number().integer().emptyToNull()
  });
}

export default function ResourceAdd() {
  const { t } = useTranslation();
  useDocumentTitle(t('resource.add.headline'));

  const navigate = useNavigate();
  const [formError, setFormError] = useState<string|undefined>(undefined);
  const [parentValues, setParentValues] = useState<Map<number,string>>(new Map());

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareRelations = async () => {
    try {
      const parentValuesResponse = await axios.get('/api/resources/parentValues');
      setParentValues(parentValuesResponse.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareRelations();
  }, []);

  const createResource = async (data: ResourceDTO) => {
    window.scrollTo(0, 0);
    console.log('ResourceAdd: createResource called with data:', data);
    try {
      await axios.post('/api/resources', data);
      setFormError(undefined);
      navigate('/resources', {
            state: {
              msgSuccess: t('resource.create.success')
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
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('resource.add.headline')}</h1>
      <div>
        <Link to="/resources" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('resource.add.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(createResource)} noValidate>
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {formError}
        </div>
      )}
      <InputRow useFormResult={useFormResult} object="resource" field="resourceName" required={true} />
      <InputRow useFormResult={useFormResult} object="resource" field="resourceType" required={true} />
      <InputRow useFormResult={useFormResult} object="resource" field="resourcePath" />
      <InputRow useFormResult={useFormResult} object="resource" field="parent" type="select" options={parentValues} />
      <button
        type="button"
        onClick={() => {
          // debug: explicitly call the react-hook-form submit handler and log
          // this helps determine if the handler is being invoked in the browser
          // (useful when users report 'button not responding')
          // eslint-disable-next-line no-console
          console.log('ResourceAdd: submit clicked');
          useFormResult.handleSubmit(createResource)();
        }}
        className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6"
      >
        {t('resource.add.headline')}
      </button>
    </form>
  </>);
}
