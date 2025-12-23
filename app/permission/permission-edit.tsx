import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PermissionDTO } from 'app/permission/permission-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    action: yup.string().emptyToNull().max(50).required(),
    resource: yup.number().integer().emptyToNull().required()
  });
}

export default function PermissionEdit() {
  const { t } = useTranslation();
  useDocumentTitle(t('permission.edit.headline'));

  const navigate = useNavigate();
  const [resourceValues, setResourceValues] = useState<Map<number,string>>(new Map());
  const params = useParams();
  const currentId = +params.id!;

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareForm = async () => {
    try {
      const resourceValuesResponse = await axios.get('/api/permissions/resourceValues');
      setResourceValues(resourceValuesResponse.data);
      const data = (await axios.get('/api/permissions/' + currentId)).data;
      useFormResult.reset(data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareForm();
  }, []);

  const updatePermission = async (data: PermissionDTO) => {
    window.scrollTo(0, 0);
    try {
      await axios.put('/api/permissions/' + currentId, data);
      navigate('/permissions', {
            state: {
              msgSuccess: t('permission.update.success')
            }
          });
    } catch (error: any) {
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('permission.edit.headline')}</h1>
      <div>
        <Link to="/permissions" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('permission.edit.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(updatePermission)} noValidate>
      <InputRow useFormResult={useFormResult} object="permission" field="id" disabled={true} type="number" />
      <InputRow useFormResult={useFormResult} object="permission" field="action" required={true} />
      <InputRow useFormResult={useFormResult} object="permission" field="resource" required={true} type="select" options={resourceValues} />
      <input type="submit" value={t('permission.edit.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
