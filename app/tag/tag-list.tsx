import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { TagDTO } from 'app/tag/tag-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function TagList() {
  const { t } = useTranslation();
  useDocumentTitle(t('tag.list.headline'));

  const [tags, setTags] = useState<TagDTO[]>([]);
  const navigate = useNavigate();

  const getAllTags = async () => {
    try {
      const response = await axios.get('/api/tags');
      setTags(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/tags/' + id);
      navigate('/tags', {
            state: {
              msgInfo: t('tag.delete.success')
            }
          });
      getAllTags();
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    getAllTags();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('tag.list.headline')}</h1>
      <div>
        <Link to="/tags/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('tag.list.createNew')}</Link>
      </div>
    </div>
    {!tags || tags.length === 0 ? (
    <div>{t('tag.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('tag.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('tag.tag.label')}</th>
            <th scope="col" className="text-left p-2">{t('tag.updatedBy.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {tags.map((tag) => (
          <tr key={tag.id} className="odd:bg-gray-100">
            <td className="p-2">{tag.id}</td>
            <td className="p-2">{tag.tag}</td>
            <td className="p-2">{tag.updatedBy}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/tags/edit/' + tag.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('tag.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(tag.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('tag.list.delete')}</button>
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
