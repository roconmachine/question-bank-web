import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { ResourceDTO } from 'app/resource/resource-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function ResourceList() {
  const { t } = useTranslation();
  useDocumentTitle(t('resource.list.headline'));

  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [resourceData, setResourceData] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

  const getAllResources = async () => {
    try {
      const response = await axios.get('/api/resources');
      const resourceData = new Map<number, string>();
      response.data.forEach((item: any) => {
        resourceData.set(item.id, item.resourceName);
      });
      setResources(response.data);
      setResourceData(resourceData);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/resources/' + id);
      navigate('/resources', {
            state: {
              msgInfo: t('resource.delete.success')
            }
          });
      getAllResources();
    } catch (error: any) {
      if (error?.response?.data?.code === 'REFERENCED') {
        const messageParts = error.response.data.message.split(',');
        navigate('/resources', {
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
    getAllResources();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('resource.list.headline')}</h1>
      <div>
        <Link to="/resources/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('resource.list.createNew')}</Link>
      </div>
    </div>
    {!resources || resources.length === 0 ? (
    <div>{t('resource.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('resource.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('resource.resourceName.label')}</th>
            <th scope="col" className="text-left p-2">{t('resource.resourceType.label')}</th>
            <th scope="col" className="text-left p-2">{t('resource.resourcePath.label')}</th>
            <th scope="col" className="text-left p-2">{t('resource.parent.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {resources.map((resource) => (
          <tr key={resource.id} className="odd:bg-gray-100">
            <td className="p-2">{resource.id}</td>
            <td className="p-2">{resource.resourceName}</td>
            <td className="p-2">{resource.resourceType}</td>
            <td className="p-2">{resource.resourcePath}</td>
            <td className="p-2">{resource.parent ? resourceData.get(resource.parent) : '-'}</td>
            <td className="p-2">
                <div className="float-right whitespace-nowrap">
                <Link to={'/resources/edit/' + resource.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('resource.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(resource.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('resource.list.delete')}</button>
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
