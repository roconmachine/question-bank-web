import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
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

export default function ResourceEdit() {
  const { t } = useTranslation();
  useDocumentTitle(t('resource.edit.headline'));

  const navigate = useNavigate();
  const [parentValues, setParentValues] = useState<Map<number,string>>(new Map());
  const params = useParams();
  const currentId = +params.id!;

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareForm = async () => {
    try {
      const parentValuesResponse = await axios.get('/api/resources/parentValues');
      setParentValues(parentValuesResponse.data);
      const data = (await axios.get('/api/resources/' + currentId)).data;
      useFormResult.reset(data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareForm();
  }, []);

  const updateResource = async (data: ResourceDTO) => {
    window.scrollTo(0, 0);
    try {
      await axios.put('/api/resources/' + currentId, data);
      navigate('/resources', {
            state: {
              msgSuccess: t('resource.update.success')
            }
          });
    } catch (error: any) {
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('resource.edit.headline')}</h1>
      <div>
        <Link to="/resources" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('resource.edit.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(updateResource)} noValidate>
      <InputRow useFormResult={useFormResult} object="resource" field="id" disabled={true} type="number" />
      <InputRow useFormResult={useFormResult} object="resource" field="resourceName" required={true} />
      <InputRow useFormResult={useFormResult} object="resource" field="resourceType" required={true} />
      <InputRow useFormResult={useFormResult} object="resource" field="resourcePath" />
      <InputRow useFormResult={useFormResult} object="resource" field="parent" type="select" options={parentValues} />
      <input type="submit" value={t('resource.edit.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
