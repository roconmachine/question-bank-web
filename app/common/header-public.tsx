import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export default function HeaderPublic() {
    const { t } = useTranslation();
    
  return (
    <header className="bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex flex-wrap items-center justify-between py-2">
          <div>
            <Link to="/" className="text-xl font-semibold text-gray-800">
            <img src="/images/logo.png" alt={t('app.title')} width="60" height="60" className="inline-block" />
            <span className="text-xl pl-3">{t('app.title')}</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}   