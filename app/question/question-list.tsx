import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router';
import { handleServerError } from 'app/common/utils';
import { QuestionDTO } from 'app/question/question-model';
import axios from 'axios';
import useDocumentTitle from 'app/common/use-document-title';


export default function QuestionList() {
  const { t } = useTranslation();
  useDocumentTitle(t('question.list.headline'));

  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [setsList, setSetsList] = useState<Map<number, string>>(new Map());
  const [categoriesList, setCategoriesList] = useState<Map<number, string>>(new Map());
  const [filterBySet, setFilterBySet] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getAllSets = async () => {
    try {
      const response = await axios.get('/api/qSets');
      const setsMap = new Map<number, string>();
      response.data.forEach((item: any) => {
        setsMap.set(item.id, item.setName);
      });
      setSetsList(setsMap);
    } catch (error: any) {
      console.error('Error fetching sets:', error);
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      const categoriesMap = new Map<number, string>();
      response.data.forEach((item: any) => {
        categoriesMap.set(item.id, item.name);
      });
      setCategoriesList(categoriesMap);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch questions for a given set from server
  const getQuestionsBySet = async (setId: number) => {
    try {
      const response = await axios.get(`/api/questions/getQuestionsBySet/${setId}`);
      setQuestions(response.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  const handleFilterBySet = (setId: number | null) => {
    // choose setId: if null, fallback to first set id
    const chosen = setId ?? (setsList.keys().next().value ?? null);
    if (chosen == null) return;
    setFilterBySet(chosen);
    // update URL param so link/bookmark works
    try {
      const search = `?set=${chosen}`;
      navigate(`/questions${search}`, { replace: true });
    } catch (e) {
      // ignore navigation errors
    }
    // fetch from server
    getQuestionsBySet(chosen);
  };

  // When URL contains ?set= or when setsList loads, determine initial set and fetch questions
  useEffect(() => {
    if (setsList.size === 0) return; // wait for sets to load
    const params = new URLSearchParams(location.search);
    const setParam = params.get('set');
    let idToUse: number | null = null;
    if (setParam) {
      const id = parseInt(setParam, 10);
      if (!Number.isNaN(id) && setsList.has(id)) {
        idToUse = id;
      }
    }
    if (idToUse == null) {
      // default to first set id
      idToUse = setsList.keys().next().value ?? null;
    }
    if (idToUse != null) {
      handleFilterBySet(idToUse);
    }
  }, [location.search, setsList]);

  const confirmDelete = async (id: number) => {
    if (!confirm(t('delete.confirm'))) {
      return;
    }
    try {
      await axios.delete('/api/questions/' + id);
      navigate('/questions', {
            state: {
              msgInfo: t('question.delete.success')
            }
          });
      // reload current set after delete
      if (filterBySet) {
        getQuestionsBySet(filterBySet);
      } else {
        // fallback to first set if none selected
        const firstSet = setsList.keys().next().value ?? null;
        if (firstSet != null) getQuestionsBySet(firstSet);
      }
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    getAllSets();
    getAllCategories();
  }, []);

  return (<>
    <div className="flex flex-wrap mb-6">
      <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('question.list.headline')}</h1>
      <div>
        <Link to="/questions/add" className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2">{t('question.list.createNew')}</Link>
      </div>
    </div>
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-medium mb-3">{t('question.filter.bySet')}</label>
          <select
            value={filterBySet?.toString() || ''}
            onChange={(e) => handleFilterBySet(e.target.value ? parseInt(e.target.value) : null)}
            className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('question.filter.allSets')}</option>
            {Array.from(setsList.entries()).map(([id, name]) => (
              <option key={id} value={id.toString()}>{name}</option>
            ))}
          </select>
        </div>
        <div className="ml-6 text-right">
          <p className="text-gray-700 text-sm font-medium">{t('question.count.label')}</p>
          <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
        </div>
      </div>
    </div>
    {!questions || questions.length === 0 ? (
    <div>{t('question.list.empty')}</div>
    ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left p-2">{t('question.id.label')}</th>
            <th scope="col" className="text-left p-2">{t('qSet.list.headline')}</th>
            <th scope="col" className="text-left p-2">{t('category.list.headline')}</th>
            <th scope="col" className="text-left p-2">{t('question.questionText.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.optA.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.optB.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.optC.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.optD.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.answer.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.correctScore.label')}</th>
            <th scope="col" className="text-left p-2">{t('question.incorrectScore.label')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-black">
          {questions.map((question) => (
          <tr key={question.id} className="odd:bg-gray-100">
            <td className="p-2">{question.id}</td>
            <td className="p-2">{question.set ? setsList.get(question.set) : '-'}</td>
            <td className="p-2">{question.category ? categoriesList.get(question.category) : '-'}</td>
            <td className="p-2 max-w-xs truncate">{question.questionText}</td>
            <td className="p-2">{question.optA}</td>
            <td className="p-2">{question.optB}</td>
            <td className="p-2">{question.optC}</td>
            <td className="p-2">{question.optD}</td>
            <td className="p-2">{question.answer}</td>
            <td className="p-2">{question.correctScore}</td>
            <td className="p-2">{question.incorrectScore}</td>
            <td className="p-2">
              <div className="float-right whitespace-nowrap">
                <Link to={'/questions/edit/' + question.id} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm">{t('question.list.edit')}</Link>
                <span> </span>
                <button type="button" onClick={() => confirmDelete(question.id!)} className="inline-block text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-200 focus:ring-3 rounded px-2.5 py-1.5 text-sm cursor-pointer">{t('question.list.delete')}</button>
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
