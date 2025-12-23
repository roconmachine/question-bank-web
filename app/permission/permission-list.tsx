import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { PermissionDTO } from 'app/permission/permission-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function PermissionList() {
  const { t } = useTranslation();
  useDocumentTitle(t('permission.list.headline'));

  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const navigate = useNavigate();

  const getAllPermissions = async () => {
    try {
      const response = await axios.get('/api/permissions');
      setPermissions(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/permissions/' + id);
      navigate('/permissions', {
            state: {
              msgInfo: t('permission.delete.success')
            }
          });
      getAllPermissions();
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    getAllPermissions();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('permission.list.headline')}</h1>
      <div>
        <Link to="/permissions/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('permission.list.createNew')}</Link>
      </div>
    </div>
    {!permissions || permissions.length === 0 ? (
    <div>{t('permission.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('permission.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('permission.action.label')}</th>
            <th scope="col" className="text-left p-2">{t('permission.resource.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {permissions.map((permission) => (
          <tr key={permission.id} className="odd:bg-gray-100">
            <td className="p-2">{permission.id}</td>
            <td className="p-2">{permission.action}</td>
            <td className="p-2">{permission.resource}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/permissions/edit/' + permission.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('permission.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(permission.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('permission.list.delete')}</button>
              </div>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
    )}
  </>);
}
