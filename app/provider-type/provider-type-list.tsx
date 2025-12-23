import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { ProviderTypeDTO } from 'app/provider-type/provider-type-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function ProviderTypeList() {
  const { t } = useTranslation();
  useDocumentTitle(t('providerType.list.headline'));

  const [providerTypes, setProviderTypes] = useState<ProviderTypeDTO[]>([]);
  const navigate = useNavigate();

  const getAllProviderTypes = async () => {
    try {
      const response = await axios.get('/api/providerTypes');
      setProviderTypes(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/providerTypes/' + id);
      navigate('/providerTypes', {
            state: {
              msgInfo: t('providerType.delete.success')
            }
          });
      getAllProviderTypes();
    } catch (error: any) {
      if (error?.response?.data?.code === 'REFERENCED') {
        const messageParts = error.response.data.message.split(',');
        navigate('/providerTypes', {
              state: {
                msgError: t(messageParts[0]!, { id: messageParts[1]! })
              }
            });
        return;
      }
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    getAllProviderTypes();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('providerType.list.headline')}</h1>
      <div>
        <Link to="/providerTypes/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('providerType.list.createNew')}</Link>
      </div>
    </div>
    {!providerTypes || providerTypes.length === 0 ? (
    <div>{t('providerType.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('providerType.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('providerType.name.label')}</th>
            <th scope="col" className="text-left p-2">{t('providerType.updatedBy.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {providerTypes.map((providerType) => (
          <tr key={providerType.id} className="odd:bg-gray-100">
            <td className="p-2">{providerType.id}</td>
            <td className="p-2">{providerType.name}</td>
            <td className="p-2">{providerType.updatedBy}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/providerTypes/edit/' + providerType.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('providerType.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(providerType.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('providerType.list.delete')}</button>
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
