import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { ContentProviderDTO } from 'app/content-provider/content-provider-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function ContentProviderList() {
  const { t } = useTranslation();
  useDocumentTitle(t('contentProvider.list.headline'));

  const [contentProviders, setContentProviders] = useState<ContentProviderDTO[]>([]);
  const [providerTypesList, setProviderTypesList] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

  const getAllProviderTypes = async () => {
    try {
      const response = await axios.get('/api/providerTypes');
      const providerTypesMap = new Map<number, string>();
      response.data.forEach((item: any) => {
        providerTypesMap.set(item.id, item.name);
      });
      setProviderTypesList(providerTypesMap);
    } catch (error: any) {
      console.error('Error fetching provider types:', error);
    }
  };

  const getAllContentProviders = async () => {
    try {
      const response = await axios.get('/api/contentProviders');
      setContentProviders(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/contentProviders/' + id);
      navigate('/contentProviders', {
            state: {
              msgInfo: t('contentProvider.delete.success')
            }
          });
      getAllContentProviders();
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    getAllProviderTypes();
    getAllContentProviders();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('contentProvider.list.headline')}</h1>
      <div>
        <Link to="/contentProviders/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('contentProvider.list.createNew')}</Link>
      </div>
    </div>
    {!contentProviders || contentProviders.length === 0 ? (
    <div>{t('contentProvider.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('contentProvider.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('contentProvider.name.label')}</th>
            <th scope="col" className="text-left p-2">{t('contentProvider.email.label')}</th>
            <th scope="col" className="text-left p-2">{t('contentProvider.website.label')}</th>
            <th scope="col" className="text-left p-2">{t('contentProvider.updatedBy.label')}</th>
            <th scope="col" className="text-left p-2">{t('contentProvider.providerType.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {contentProviders.map((contentProvider) => (
          <tr key={contentProvider.id} className="odd:bg-gray-100">
            <td className="p-2">{contentProvider.id}</td>
            <td className="p-2">{contentProvider.name}</td>
            <td className="p-2">{contentProvider.email}</td>
            <td className="p-2">{contentProvider.website}</td>
            <td className="p-2">{contentProvider.updatedBy}</td>
            <td className="p-2">{contentProvider.providerType ? providerTypesList.get(contentProvider.providerType) : '-'}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/contentProviders/edit/' + contentProvider.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('contentProvider.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(contentProvider.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('contentProvider.list.delete')}</button>
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
