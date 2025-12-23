import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserDTO } from 'app/user/user-model';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';


function getSchema() {
  setYupDefaults();
  return yup.object({
    username: yup.string().emptyToNull().max(100).required(),
    fullName: yup.string().emptyToNull().max(150),
    email: yup.string().emptyToNull().max(150),
    passwordHash: yup.string().emptyToNull().max(255).required(),
    isActive: yup.bool(),
    createdAt: yup.string().emptyToNull().offsetDateTime(),
    userRoleRoles: yup.array(yup.number().required()).emptyToNull().json()
  });
}

export default function UserEdit() {
  const { t } = useTranslation();
  useDocumentTitle(t('user.edit.headline'));

  const navigate = useNavigate();
  const [userRoleRolesValues, setUserRoleRolesValues] = useState<Map<number,string>>(new Map());
  const params = useParams();
  const currentId = +params.id!;

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
  });

  const prepareForm = async () => {
    try {
      const userRoleRolesValuesResponse = await axios.get('/api/users/userRoleRolesValues');
      setUserRoleRolesValues(userRoleRolesValuesResponse.data);
      const data = (await axios.get('/api/users/' + currentId)).data;
      if (data.userRoleRoles) {
        data.userRoleRoles = JSON.stringify(data.userRoleRoles, undefined, 2);
      }
      useFormResult.reset(data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareForm();
  }, []);

  const updateUser = async (data: UserDTO) => {
    window.scrollTo(0, 0);
    try {
      await axios.put('/api/users/' + currentId, data);
      navigate('/users', {
            state: {
              msgSuccess: t('user.update.success')
            }
          });
    } catch (error: any) {
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('user.edit.headline')}</h1>
      <div>
        <Link to="/users" className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-4 rounded px-5 py-2">{t('user.edit.back')}</Link>
      </div>
    </div>
    <form onSubmit={useFormResult.handleSubmit(updateUser)} noValidate>
      <InputRow useFormResult={useFormResult} object="user" field="id" disabled={true} type="number" />
      <InputRow useFormResult={useFormResult} object="user" field="username" required={true} />
      <InputRow useFormResult={useFormResult} object="user" field="fullName" />
      <InputRow useFormResult={useFormResult} object="user" field="email" />
      <InputRow useFormResult={useFormResult} object="user" field="passwordHash" required={true} />
      <InputRow useFormResult={useFormResult} object="user" field="isActive" type="checkbox" />
      <InputRow useFormResult={useFormResult} object="user" field="createdAt" />
      <InputRow useFormResult={useFormResult} object="user" field="userRoleRoles" type="multiselect" options={userRoleRolesValues} />
      <input type="submit" value={t('user.edit.headline')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
    </form>
  </>);
}
