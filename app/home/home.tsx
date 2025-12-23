import React from 'react';
import './home.css';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from 'app/common/use-document-title';


export default function Home() {
  const { t } = useTranslation();
  useDocumentTitle(t('home.index.headline'));

  return (<>
    <h1 className="grow text-3xl md:text-4xl font-medium mb-8">{t('home.index.headline')}</h1>
    
    
  
  </>);
}