import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { ExamDTO } from 'app/exam/exam-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function ExamList() {
  const { t } = useTranslation();
  useDocumentTitle(t('exam.list.headline'));

  const [exams, setExams] = useState<ExamDTO[]>([]);
  const [provider, setProviderValues] = useState<Map<number,string>>(new Map());

  const navigate = useNavigate();

  const getAllExams = async () => {
    try {
      const response = await axios.get('/api/exams');
      setExams(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const getAllProviders = async () => {
    try{
      const response = await axios.get('/api/contentProviders');
      const providerMap = new Map<number, string>();
      response.data.forEach((item: any) => {
        providerMap.set(item.id, item.name);
      });
      setProviderValues(providerMap);

    }catch(error: any){
      handleServerError(error, navigate);
    }
  };


  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/exams/' + id);
      navigate('/exams', {
            state: {
              msgInfo: t('exam.delete.success')
            }
          });
      getAllExams();
    } catch (error: any) {
      if (error?.response?.data?.code === 'REFERENCED') {
        const messageParts = error.response.data.message.split(',');
        navigate('/exams', {
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
    getAllProviders();
  }, []);



  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('exam.list.headline')}</h1>
      <div>
        <Link to="/exams/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('exam.list.createNew')}</Link>
      </div>
    </div>
    {!exams || exams.length === 0 ? (
    <div>{t('exam.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('exam.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('exam.name.label')}</th>
            <th scope="col" className="text-left p-2">{t('exam.updatedBy.label')}</th>
            <th scope="col" className="text-left p-2">{t('exam.provider.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {exams.map((exam) => (
          <tr key={exam.id} className="odd:bg-gray-100">
            <td className="p-2">{exam.id}</td>
            <td className="p-2">{exam.name}</td>
            <td className="p-2">{exam.updatedBy}</td>
            <td className="p-2">{exam.provider ? provider.get(exam.provider) : "-"}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/exams/edit/' + exam.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('exam.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(exam.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('exam.list.delete')}</button>
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
