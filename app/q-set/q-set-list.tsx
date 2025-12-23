import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { QSetDTO } from 'app/q-set/q-set-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function QSetList() {
  const { t } = useTranslation();
  useDocumentTitle(t('qSet.list.headline'));

  const [qSets, setQSets] = useState<QSetDTO[]>([]);
  const [examsList, setExamsList] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

  const getAllExams = async () => {
    try {
      const response = await axios.get('/api/exams');
      const examsMap = new Map<number, string>();
      response.data.forEach((item: any) => {
        examsMap.set(item.id, item.name);
      });
      setExamsList(examsMap);
    } catch (error: any) {
      console.error('Error fetching exams:', error);
    }
  };

  const getAllQSets = async () => {
    try {
      const response = await axios.get('/api/qSets');
      setQSets(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/qSets/' + id);
      navigate('/qSets', {
            state: {
              msgInfo: t('qSet.delete.success')
            }
          });
      getAllQSets();
    } catch (error: any) {
      if (error?.response?.data?.code === 'REFERENCED') {
        const messageParts = error.response.data.message.split(',');
        navigate('/qSets', {
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
    getAllExams();
    getAllQSets();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('qSet.list.headline')}</h1>
      <div>
        <Link to="/qSets/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('qSet.list.createNew')}</Link>
      </div>
    </div>
    {!qSets || qSets.length === 0 ? (
    <div>{t('qSet.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('qSet.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('qSet.setName.label')}</th>
            <th scope="col" className="text-left p-2">{t('qSet.status.label')}</th>
            <th scope="col" className="text-left p-2">{t('qSet.updatedBy.label')}</th>
            <th scope="col" className="text-left p-2">{t('qSet.exam.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {qSets.map((qSet) => (
          <tr key={qSet.id} className="odd:bg-gray-100">
            <td className="p-2"><Link to={"/questions?set=" + qSet.id} className='inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm'>{qSet.id}</Link></td>
            <td className="p-2">{qSet.setName}</td>
            <td className="p-2">{qSet.status}</td>
            <td className="p-2">{qSet.updatedBy}</td>
            <td className="p-2">{qSet.exam ? examsList.get(qSet.exam) : '-'}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/qSets/edit/' + qSet.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('qSet.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(qSet.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('qSet.list.delete')}</button>
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
